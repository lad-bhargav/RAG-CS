import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embedding.js";
import "dotenv/config"

export const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: "langchainjs-testing",
});