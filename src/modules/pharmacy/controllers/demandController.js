import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js"

import demandSchema from "../validators/demandSchema.js";
import createDemandService from "../services/demandService.js";

const createDemand = catchAsync(async (req, res) => {
    const result = demandSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const pharmacyId = req.user.id;

    const data = await createDemandService(pharmacyId, result.data);

    res.status(201).json({
        status: "success",
        data: serializeBigInt(data),
    });
});

export default createDemand;