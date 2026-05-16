import AppError from "../utils/AppError.js";

const checkPharmacyOwnership = (
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
        "PHARMACY"
    ) {
        return next(
            new AppError(
                "Forbidden",
                403
            )
        );
    }

    const pharmacyId = req.params.pid;

    if (req.user.id !== pharmacyId) {
        return next(
            new AppError(
                "You do not have access to this pharmacy",
                403
            )
        );
    }

    next();
};

export default checkPharmacyOwnership;