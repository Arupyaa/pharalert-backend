import prisma from "../../../prisma.js";

async function createDemandService(pharmacyId, data) {
    const { medicationId, type, medicationReplacementId,customerName } = data;

    console.log(pharmacyId);

    // 1. create demand log always
    const demand = await prisma.demandLog.create({
        data: {
            pharmacyId,
            medicationId,
            demandType: type,
        },
    });

    let replacement = null;

    // 2. handle replacement case
    if (type == "REPLACEMENT_ACCEPTED") {
        if (!medicationReplacementId) {
            throw {
                status: 400,
                message: "replacementMedicationId is required for accepted replacement",
            };
        }

        replacement = await prisma.replacement.create({
            data: {
                pharmacyId,
                customerName,
                medicationReplacementId,
                isAccepted:true
            },
        });
    }

    // 3. handle refused replacement (optional tracking)
    if (type == "REPLACEMENT_REFUSED") {
        replacement = await prisma.replacement.create({
            data: {
                pharmacyId,
                customerName,
                medicationReplacementId,
                isAccepted:false
            },
        });
    }

    return {
        demand,
        replacement,
    };
}

export default createDemandService;