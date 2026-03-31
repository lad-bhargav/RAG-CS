import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { splitDocs } from "../Action/splitDocs.js";
import { vectorStore } from "../lib/vectorStore.js";

export const addPDFinVectorDB = async(pdf) => {
    const loader = new PDFLoader(pdf);
    const docs = await loader.load();

    const texts = splitDocs(docs);
    await vectorStore.addDocuments(texts);
}