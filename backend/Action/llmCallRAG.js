import { llm } from "../config/llm.js";

export const LLMCallRAG = async(query,context) =>{
    const prompt = `
        You are an assistant answering questions about a PDF.
        Use the context below to answer the question.
        
        CONTEXT:
        ${context}
        
        QUESTION: 
        ${query}
    `;
    
    const llmRes = await llm.invoke(prompt);
    return llmRes;
}