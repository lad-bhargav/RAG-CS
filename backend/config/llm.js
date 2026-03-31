import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import "dotenv/config";

export const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.5-flash", // 👈 2.5-flash is perfect for the Chat/LLM part
    maxOutputTokens: 2048,
});