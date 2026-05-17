import jwt from "jsonwebtoken";

import prisma from "../prisma.js";

import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

const authenticate = catchAsync(
  async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      throw new AppError(
        "Unauthorized",
        401
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      );
    } catch {
      throw new AppError(
        "Invalid or expired token",
        401
      );
    }

    let account = null;

    switch (decoded.accountType) {
      case "ADMIN":
        account = await prisma.admin.findUnique({
          where: {
            id: decoded.id,
          },
        });
        break;

      case "PHARMACY":
        account = await prisma.pharmacy.findUnique({
          where: {
            id: decoded.id,
          },
        });
        break;

      case "COMPANY":
        account =
          await prisma.medicationCompany.findUnique({
            where: {
              id: decoded.id,
            },
          });
        break;

      case "FREE_USER":
      case "PAID_USER":
        account = await prisma.endUser.findUnique({
          where: {
            id: decoded.id,
          },
        });
        break;

      default:
        throw new AppError(
          "Unauthorized",
          401
        );
    }

    if (!account) {
      throw new AppError(
        "Account no longer exists",
        401
      );
    }

    req.user = {
      ...account,
      accountType: decoded.accountType,
    };

    next();
  }
);

export default authenticate;