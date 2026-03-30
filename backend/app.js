import express from "express";
import 'dotenv/config';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings } from "@langchain/ollama";

const app = express();
app.use(express.json());

// 1. Setup Embeddings (Local Ollama)
const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11435",
});

// 2. Initialize Qdrant Vector Store (Cloud)
// Note: Ensure the collection "langchainjs-testing" exists in your Cloud Dashboard 
// with Size: 768 and Distance: Cosine.
export const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL, 
    apiKey: process.env.QDRANT_API_KEY, 
    collectionName: "ragqdrnt",
});

// 3. Function to Process PDF and Add to Cloud
async function processAndUploadPDF() {
    try {
        console.log("Loading PDF...");
        const loader = new PDFLoader("./pdf/IPL.pdf");
        const docs = await loader.load();

        console.log("Splitting text into chunks...");
        const splitter = new RecursiveCharacterTextSplitter({ 
            chunkSize: 500, 
            chunkOverlap: 5 
        });
        
        // splitDocuments keeps the metadata (like page numbers) intact
        const splitDocs = await splitter.splitDocuments(docs);

        console.log(`Uploading ${splitDocs.length} chunks to Qdrant Cloud...`);
        await vectorStore.addDocuments(splitDocs);
        
        console.log("✅ Successfully uploaded to Qdrant Cloud!");
    } catch (error) {
        console.error("❌ Error during upload:", error);
    }
}

// Run the upload once when the server starts (or trigger via a route)
processAndUploadPDF();

// 4. Chat/Search Route
app.post("/chatpdf", async (req, res) => {
    try {
        const { query } = req.body;
        
        // Similarity search
        const results = await vectorStore.similaritySearch(query, 3);
        
        // Combine results for context
        const context = results.map(r => r.pageContent).join("\n\n");

        res.json({
            message: "Search successful",
            context: context,
            sourceMetadata: results.map(r => r.metadata)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));