import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import "dotenv/config"

export const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-embedding-2-preview", // 👈 This is the correct embedding model name
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    // Ensure this matches your Qdrant collection dimension (768)
    outputDimensionality: 768, 
});