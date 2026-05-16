import AppError from "../utils/AppError.js";

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(
                new AppError(
                    "Unauthorized",
                    401
                )
            );
        }

        if (
            !allowedRoles.includes(
                req.user.accountType
            )
        ) {
            return next(
                new AppError(
                    "Forbidden",
                    403
                )
            );
        }

        next();
    };
};

export default authorize;