import express from "express";
import { getReceiptsPaginated } from "./modules/receipt/receiptService.js";
import { serializeBigInt } from "./utils/serializeBigINT.js";

const app = express();


app.get("/pharmacy/receipts", async (req,res)=>{
    const responseJson = await getReceiptsPaginated("758d9ceb-9caf-431c-bd7c-bee3012048ad","asc",2,5);
    res.json(serializeBigInt(responseJson));
});

const PORT = 8080;

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
});