import express from "express";
import pharmacyRoutes from "./modules/pharmacy/index.js"
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());

app.use("/pharmacy",pharmacyRoutes);

const PORT = 8080;
app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
});