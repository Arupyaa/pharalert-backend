import catchAsync from "../../../utils/catchAsync.js";
import { serializeBigInt } from "../../../utils/serializeBigInt.js";
import { getMySuggestedMedicationsService } from "../services/suggestedMedicationsService.js";

export const getMySuggestedMedications = catchAsync(async (req, res) => {
    const suggestions = await getMySuggestedMedicationsService(req.user.id);

    res.status(200).json({
        status: "success",
        data: serializeBigInt(suggestions),
    });
});
