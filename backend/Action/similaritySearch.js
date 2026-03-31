import { vectorStore } from "../lib/vectorStore.js";

export const searchInVectorDB = async(query) => {
    const searchResults = await vectorStore.similaritySearch(query, 3);
    const context = searchResults.map(r => r.pageContent).join("\n\n");
    return context;
}