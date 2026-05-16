import jwt from "jsonwebtoken";

const generateRefreshToken = (
    payload
) => {
    return jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "14d",
        }
    );
};

export default generateRefreshToken;