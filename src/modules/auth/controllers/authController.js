import { createEndUser } from "../services/registerService.js";
import { endUserSchema } from "../validators/registerSchemas.js";
import { loginSchema } from "../validators/loginSchema.js";
import { loginService } from "../services/loginService.js";
import { logoutService } from "../services/logoutService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const registerUser = async (req, res) => {
    const { role } = req.body;

    switch (role) {
        case "pharmacy":
            return res.status(200).json({ message: "pharmacy registered" });

        case "company":
            return res.status(200).json({ message: "company registered" });

        case "user":
            {
                const result = endUserSchema.safeParse(req.body);

                if (!result.success) {
                    return res.status(400).json({
                        message: "Validation failed",
                        errors: result.error.flatten(),
                    });
                }

                const user = await createEndUser(result.data);
                const { passwordHash, ...safeUser } = user;

                return res.status(201).json({
                    message: "user registered",
                    data: safeUser,
                });
            }

        default:
            return res.status(400).json({ message: "invalid role" });
    }
}


export const loginUser = async (req, res) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation error",
            errors: result.error.flatten(),
        });
    }

    try {
        const data = await loginService(result.data);

        return res.status(200).json({
            message: "Login successful",
            ...data,
        });

    } catch (err) {
        return res.status(err.status || 500).json({
            message: err.message,
        });
    }
};


export const logoutUser = async (req, res) => {
    try {
        const refreshToken =
            req.body.refreshToken || req.cookies?.refreshToken;

        await logoutService(refreshToken);

        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (err) {
        return res.status(err.status || 500).json({
            message: err.message,
        });
    }
};