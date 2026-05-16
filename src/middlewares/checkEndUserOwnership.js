import AppError from "../utils/AppError.js";

const checkEndUserOwnership = (
    req,
    res,
    next
) => {
    if (
        req.user.accountType === "ADMIN"
    ) {
        return next();
    }

    if (
        req.user.accountType !==
        "FREE_USER" &&
        req.user.accountType !==
        "PAID_USER"
    ) {
        return next(
            new AppError(
                "Forbidden",
                403
            )
        );
    }

    const userId = req.params.userId;

    if (req.user.id !== userId) {
        return next(
            new AppError(
                "You do not have access to this account",
                403
            )
        );
    }

    next();
};

export default checkEndUserOwnership;