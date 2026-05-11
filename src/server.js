import express from "express";
import pharmacyRoutes from "./modules/pharmacy/index.js"

const app = express();

app.use("/pharmacy",pharmacyRoutes);


const PORT = 8080;

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
});