import express from "express";
import 'dotenv/config';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { TaskType } from "@google/generative-ai";

const app = express();
app.use(express.json());

// 1. Correct Embeddings Config (Using an actual embedding model)
const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-embedding-2-preview", // 👈 This is the correct embedding model name
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    // Ensure this matches your Qdrant collection dimension (768)
    outputDimensionality: 768, 
});

// 2. Initialize LLM (The "Brain")
const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-flash", // 👈 1.5-flash is perfect for the Chat/LLM part
    maxOutputTokens: 2048,
});

// 3. Initialize Qdrant Vector Store
// Note: We use 'await' here, so ensure your node version supports top-level await
export const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: "langchainjs-testing",
});

// 4. Process and Upload PDF Function
async function processAndUploadPDF() {
    try {
        console.log("Checking PDF directory...");
        const loader = new PDFLoader("./pdf/IPL.pdf");
        const docs = await loader.load();

        const splitter = new RecursiveCharacterTextSplitter({ 
            chunkSize: 1000, 
            chunkOverlap: 100 
        });
        const splitDocs = await splitter.splitDocuments(docs);

        if (splitDocs.length === 0) throw new Error("No text found in PDF.");

        console.log(`Uploading ${splitDocs.length} chunks to Qdrant Cloud...`);
        await vectorStore.addDocuments(splitDocs);
        
        console.log("✅ Successfully uploaded to Qdrant Cloud!");
    } catch (error) {
        console.error("❌ Upload Error:", error.message);
    }
}

// Run upload once on startup (or comment this out if already uploaded)
processAndUploadPDF();

// 5. Chat Endpoint
app.post("/chatpdf", async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "No query provided" });

        // Search the vector database
        const searchResults = await vectorStore.similaritySearch(query, 3);
        const context = searchResults.map(r => r.pageContent).join("\n\n");

        // Ask the LLM
        const prompt = `
            You are an assistant answering questions about a PDF.
            Use the context below to answer the question.
            
            CONTEXT:
            ${context}
            
            QUESTION: 
            ${query}
        `;

        const llmRes = await llm.invoke(prompt);
        res.json({ ans: llmRes.content });

    } catch (error) {
        console.error("❌ Chat Error:", error.message);
        res.status(500).json({ error: "Something went wrong with the AI." });
    }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));