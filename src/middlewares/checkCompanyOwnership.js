import AppError from "../utils/AppError.js";

const checkCompanyOwnership = (
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
        "COMPANY"
    ) {
        return next(
            new AppError(
                "Forbidden",
                403
            )
        );
    }

    const companyId =
        req.params.companyId;

    if (req.user.id !== companyId) {
        return next(
            new AppError(
                "You do not have access to this company",
                403
            )
        );
    }

    next();
};

export default checkCompanyOwnership;