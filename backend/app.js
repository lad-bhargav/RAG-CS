import express from "express";
import 'dotenv/config';
import { SearchInRAGWithLLM } from "./pdf/searchInRAG.js";
import { addPDFinVectorDB } from "./pdf/addPDFinVectorDB.js";

const app = express();
app.use(express.json());

app.post("/chatpdf", async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: "No query provided" });

        const llmRes = await SearchInRAGWithLLM(query);;
        
        res.json({ ans: llmRes.content });

    } catch (error) {
        console.error("❌ Chat Error:", error.message);
        res.status(500).json({ error: "Something went wrong with the AI." });
    }
});

app.post("/addpdf",async(req,res)=>{
    try {
        const {pdf} = req.body;
        if(!pdf) return res.status(400).json({error:"No PDF provided"});
    
        const response = await addPDFinVectorDB(pdf);
        res.json({message:"PDF added to vector database", response});
    } catch (error) {
        console.error("❌ Add PDF Error:", error.message);
        res.status(500).json({ error: "Something went wrong while adding the PDF." });
    }
})

const PORT = 8080;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));