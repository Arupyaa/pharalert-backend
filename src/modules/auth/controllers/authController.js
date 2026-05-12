import { createEndUser } from "../services/registerService.js";
import { endUserSchema } from "../validators/registerSchemas.js";

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