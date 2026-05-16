const errorMiddleware = (
    err,
    req,
    res,
    next
) => {
    console.error(err);

    res.status(
        err.statusCode || 500
    ).json({
        status:
            err.status || "error",

        message:
            err.message ||
            "Internal server error",

        ...(err.errors && {
            errors: err.errors,
        }),
    });
};

export default errorMiddleware;