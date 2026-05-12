import prisma from "../../../prisma.js";
import bcrypt from "bcrypt";

export async function createEndUser(data) {
    const hashedPassword = await bcrypt.hash(data.password,10);


    const user = prisma.endUser.create({
        data: {
            userName: data.userName,
            email: data.email,
            passwordHash: hashedPassword,
            accountType: "free"
        }
    });

    return user;
}