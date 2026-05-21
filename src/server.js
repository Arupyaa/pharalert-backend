import dotenv from "dotenv";
dotenv.config();
import express from "express";
import pharmacyRoutes from "./modules/pharmacy/index.js"
import medicationRoutes from "./modules/medication/index.js"
import cors from "cors";
import authRoutes from "./modules/auth/index.js"
import userRoutes from "./modules/user/index.js"
import companyRoutes from "./modules/company/index.js"
import regionRoutes from "./modules/region/index.js"
import categoryRoutes from "./modules/category/index.js"
import errorMiddleware from "./middlewares/errorMiddleware.js";
import AppError from "./utils/AppError.js";

const app = express();
app.use(cors());

app.use(express.json());


//routes
app.use("/auth", authRoutes);
app.use("/pharmacy", pharmacyRoutes);
app.use("/user", userRoutes);
app.use("/medications", medicationRoutes);
app.use("/company", companyRoutes);
app.use("/regions", regionRoutes);
app.use("/categories", categoryRoutes);

//error handling middleware
app.use((req, res, next) => {
    next(
        new AppError(
            `Route ${req.originalUrl} not found`,
            404
        )
    );
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});