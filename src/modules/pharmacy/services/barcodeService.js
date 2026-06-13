import prisma from "../../../prisma.js";
import AppError from "../../../utils/AppError.js";

const medicationSelect = {
    id: true,
    brandName: true,
    genericName: true,
    manufacturingCompany: true,
    unitPrice: true,
    category: { select: { categoryName: true } },
    company: { select: { companyName: true } },
};

export const getAllBarcodesService = async () => {
    return prisma.medicationBarcode.findMany({
        include: { medication: { select: medicationSelect } },
        orderBy: { id: "desc" },
    });
};

export const getBarcodeByValueService = async (barcodeValue) => {
    const barcode = await prisma.medicationBarcode.findUnique({
        where: { barcode: barcodeValue },
        include: { medication: { select: medicationSelect } },
    });

    if (!barcode) throw new AppError("Barcode not found", 404);
    return barcode;
};

export const createBarcodeService = async (data) => {
    const medication = await prisma.medication.findUnique({
        where: { id: data.medicationId },
    });
    if (!medication || medication.deletedAt) {
        throw new AppError("Medication not found", 404);
    }

    return prisma.medicationBarcode.create({
        data: { barcode: data.barcode, medicationId: data.medicationId },
        include: { medication: { select: medicationSelect } },
    });
};
