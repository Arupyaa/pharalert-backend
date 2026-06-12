import { createOrderSchema } from "../validators/createOrderValidator.js";
import { createOrderService } from "../services/orderService.js";

import AppError from "../../../utils/AppError.js";
import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";

export const createOrder = catchAsync(async (req, res) => {
    const result = createOrderSchema.safeParse(req.body);

    if (!result.success) {
        throw new AppError("Validation failed", 400, result.error.flatten());
    }

    const pharmacyId = req.user.id;

    const order = await createOrderService(pharmacyId, result.data);

    res.status(201).json({
        status: "success",
        data: serializeBigInt(order),
    });
});
