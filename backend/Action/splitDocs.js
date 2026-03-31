import { splitter } from "../lib/textSplitter.js"

export const splitDocs = async(docs) => {
    const texts = await splitter.splitDocuments(docs);
    return texts;
}