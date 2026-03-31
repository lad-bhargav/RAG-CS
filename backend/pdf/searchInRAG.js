import { LLMCallRAG } from "../Action/llmCallRAG.js";
import { searchInVectorDB } from "../Action/similaritySearch.js"

export const SearchInRAGWithLLM = async(query) => {
    const context = await searchInVectorDB(query);
    const llRes = await LLMCallRAG(query,context);
    return llRes;
}