import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

//this seed file: adds Endusers, pharmacies, companies, regions, medications and medicationCategories


/* =========================
   FIXED DATA
========================= */

const regions = [
    "Cairo",
    "Giza",
    "Alexandria",
    "Dakahlia",
    "Gharbia",
    "Qalyubia",
];

const admins = [
    { userName: "arupyaa", email: "arupyaa@pharma.com", passwordHash: "pass123" },
    { userName: "omgran", email: "omgran@pharma.com", passwordHash: "pass123" },
    { userName: "Ezzy", email: "Ezzy@pharma.com", passwordHash: "pass123" },
];



const freeUsernames = [
    "ahmed_samir", "mohamed_ali", "youssef_hassan", "omar_tarek", "khaled_nasser",
    "hassan_mohsen", "mostafa_adel", "mahmoud_farouk", "ibrahim_said", "sherif_ahmed",
    "nour_ahmed", "salma_mohamed", "mariam_hassan", "yasmin_ali", "dina_tarek",
    "fatma_kamal", "aya_mohsen", "sara_hassan", "reham_adel", "menna_nasser",
    "youssef_khaled", "omar_essam", "ahmed_hossam", "mohamed_samir", "tamer_ashraf",
    "mostafa_saeed", "karim_ahmed", "mohsen_gamal", "hossam_ali", "farouk_ismail",
    "nada_hassan", "noha_mohamed", "shahd_ahmed", "farah_tarek", "huda_ali",
    "reem_samir", "malak_essam", "mona_adel", "nourhan_khaled", "aya_samir",
    "ahmed_essam", "mohamed_tarek", "youssef_ali", "omar_hassan", "khaled_ahmed",
    "hassan_tamer", "mostafa_kamal", "mahmoud_ali", "ibrahim_ahmed", "sherif_khaled",
    "ahmed_nasser", "mohamed_hassan", "youssef_samir", "omar_ahmed", "khaled_ali",
    "hassan_essam", "mostafa_ali", "mahmoud_tarek", "ibrahim_hassan", "sherif_samir",
    "nour_ali", "salma_ahmed", "mariam_samir", "yasmin_hassan", "dina_ali",
    "fatma_ahmed", "aya_khaled", "sara_samir", "reham_hassan", "menna_ali",
    "youssef_ahmed", "omar_samir", "ahmed_ali", "mohamed_ahmed", "tamer_ali",
    "mostafa_ali2", "karim_samir", "mohsen_ahmed", "hossam_hassan", "farouk_ali",
    "nada_samir", "noha_ali", "shahd_hassan", "farah_ahmed", "huda_samir",
    "reem_ali", "malak_ahmed", "mona_samir", "nourhan_ali", "aya_ahmed",
    "ahmed_khaled", "mohamed_ali2", "youssef_hassan2", "omar_tarek2", "khaled_nasser2",
    "asmaa_omar", "sayed_khaled", "rahma_ahmed", "khloud_tareq", "seif_abdallah"
];

const paidUsernames = [
    "ahmed_elshamy", "mohamed_zaki", "youssef_elnaggar", "omar_hany", "khaled_abdelrahman",
    "hassan_elmasry", "mostafa_gaber", "mahmoud_salem", "ibrahim_ghali", "sherif_mostafa",
    "nour_elshazly", "salma_mahfouz", "mariam_elshamy", "yasmin_fouad", "dina_elgohary",
    "fatma_sobhy", "aya_abdallah", "sara_elkholy", "reham_fathy", "menna_kareem",
    "tamer_elbanna", "karim_abdelsalam", "hossam_elrefaie", "farouk_mahdy", "nada_elkady",
    "noha_sherif", "shahd_abdelaziz", "farah_eltohamy", "huda_gomaa", "reem_elsayed",
];


const companies = [
    { companyName: "Pharma Egypt", email: "contact@pharmaegypt.com", phoneNumber: "+201001112223", passwordHash: "pass123", accountStatus: "active" },
    { companyName: "Nile Pharma", email: "info@nilepharma.com", phoneNumber: "+201002223334", passwordHash: "pass123", accountStatus: "active" },
    { companyName: "Cairo Drug Industries", email: "sales@cairodrug.com", phoneNumber: "+201003334445", passwordHash: "pass123", accountStatus: "active" },
    { companyName: "Delta Med", email: "support@deltamed.com", phoneNumber: "+201004445556", passwordHash: "pass123", accountStatus: "active" },
    { companyName: "Arab Medical Co", email: "contact@arabmed.com", phoneNumber: "+201005556667", passwordHash: "pass123", accountStatus: "active" },
    { companyName: "Medline Egypt", email: "info@medlineegypt.com", phoneNumber: "+201006667778", passwordHash: "pass123", accountStatus: "active" },
];

const categories = [
    "Analgesics",
    "Antibiotics",
    "Cardiovascular",
    "Gastrointestinal",
    "Diabetes",
    "Allergy",
];

/* =========================
   MEDICATIONS (REALISTIC)
========================= */

const medications = [
    { brandName: "Panadol Extra", genericName: "Paracetamol + Caffeine", categoryIndex: 0, companyIndex: 0, unitPrice: 45 },
    { brandName: "Adol", genericName: "Paracetamol", categoryIndex: 0, companyIndex: 1, unitPrice: 25 },
    { brandName: "Brufen", genericName: "Ibuprofen", categoryIndex: 0, companyIndex: 2, unitPrice: 60 },

    { brandName: "Augmentin", genericName: "Amoxicillin + Clavulanate", categoryIndex: 1, companyIndex: 0, unitPrice: 180 },
    { brandName: "Zithromax", genericName: "Azithromycin", categoryIndex: 1, companyIndex: 1, unitPrice: 150 },
    { brandName: "Ceftriaxone", genericName: "Ceftriaxone", categoryIndex: 1, companyIndex: 2, unitPrice: 95 },

    { brandName: "Concor", genericName: "Bisoprolol", categoryIndex: 2, companyIndex: 3, unitPrice: 120 },
    { brandName: "Lipitor", genericName: "Atorvastatin", categoryIndex: 2, companyIndex: 4, unitPrice: 200 },
    { brandName: "Plavix", genericName: "Clopidogrel", categoryIndex: 2, companyIndex: 5, unitPrice: 250 },

    { brandName: "Nexium", genericName: "Esomeprazole", categoryIndex: 3, companyIndex: 0, unitPrice: 170 },
    { brandName: "Motilium", genericName: "Domperidone", categoryIndex: 3, companyIndex: 1, unitPrice: 55 },
    { brandName: "Flagyl", genericName: "Metronidazole", categoryIndex: 3, companyIndex: 2, unitPrice: 40 },

    { brandName: "Glucophage", genericName: "Metformin", categoryIndex: 4, companyIndex: 3, unitPrice: 35 },
    { brandName: "Amaryl", genericName: "Glimepiride", categoryIndex: 4, companyIndex: 4, unitPrice: 80 },
    { brandName: "Januvia", genericName: "Sitagliptin", categoryIndex: 4, companyIndex: 5, unitPrice: 300 },

    { brandName: "Zyrtec", genericName: "Cetirizine", categoryIndex: 5, companyIndex: 0, unitPrice: 50 },
    { brandName: "Aerius", genericName: "Desloratadine", categoryIndex: 5, companyIndex: 1, unitPrice: 65 },
    { brandName: "Telfast", genericName: "Fexofenadine", categoryIndex: 5, companyIndex: 2, unitPrice: 85 },
    { brandName: "Voltaren", genericName: "Diclofenac", categoryIndex: 0, companyIndex: 3, unitPrice: 70 },
    { brandName: "Cataflam", genericName: "Diclofenac Potassium", categoryIndex: 0, companyIndex: 4, unitPrice: 65 },
    { brandName: "Panadol Cold & Flu", genericName: "Paracetamol + Pseudoephedrine", categoryIndex: 0, companyIndex: 5, unitPrice: 55 },

    { brandName: "Klacid", genericName: "Clarithromycin", categoryIndex: 1, companyIndex: 0, unitPrice: 190 },
    { brandName: "Flagyl Forte", genericName: "Metronidazole", categoryIndex: 1, companyIndex: 1, unitPrice: 75 },
    { brandName: "Dalacin C", genericName: "Clindamycin", categoryIndex: 1, companyIndex: 2, unitPrice: 210 },

    { brandName: "Norvasc", genericName: "Amlodipine", categoryIndex: 2, companyIndex: 3, unitPrice: 95 },
    { brandName: "Coversyl", genericName: "Perindopril", categoryIndex: 2, companyIndex: 4, unitPrice: 130 },
    { brandName: "Ezetrol", genericName: "Ezetimibe", categoryIndex: 2, companyIndex: 5, unitPrice: 220 },

    { brandName: "Buscopan", genericName: "Hyoscine Butylbromide", categoryIndex: 3, companyIndex: 0, unitPrice: 45 },
    { brandName: "Duspatalin", genericName: "Mebeverine", categoryIndex: 3, companyIndex: 1, unitPrice: 110 },

    { brandName: "Forxiga", genericName: "Dapagliflozin", categoryIndex: 4, companyIndex: 2, unitPrice: 320 },
];

/* =========================
   PHARMACY NAMES
========================= */

// const pharmacyNames = Array.from({ length: 30 }, (_, i) =>
//     `El Shifa Pharmacy ${i + 1}`
// );

const pharmacyNames = [
    "El Shifa Pharmacy",
    "Al Amal Pharmacy",
    "Nile Care Pharmacy",
    "MediLine Pharmacy",
    "El Ezaby Pharmacy",
    "Green Cross Pharmacy",
    "Hayat Pharmacy",
    "Royal Care Pharmacy",
    "City Pharma",
    "Al Salam Pharmacy",
    "Future Pharmacy",
    "Cure Point Pharmacy",
    "Wellness Pharmacy",
    "Pharma One",
    "Delta Pharmacy",
    "El Noor Pharmacy",
    "Healing Hands Pharmacy",
    "MedZone Pharmacy",
    "Care Plus Pharmacy",
    "Ibn Sina Pharmacy",
    "Horus Pharmacy",
    "El Mostaqbal Pharmacy",
    "Prime Care Pharmacy",
    "Shifa Express Pharmacy",
    "Life Line Pharmacy",
    "Al Hayah Pharmacy",
    "Sigma Pharmacy",
    "Atlas Pharmacy",
    "EverCare Pharmacy",
    "Pulse Pharmacy",
];

/* =========================
   HELPERS
========================= */

const egyptCoords = {
    Cairo: { lat: 30.0444, lng: 31.2357 },
    Giza: { lat: 30.0131, lng: 31.2089 },
    Alexandria: { lat: 31.2001, lng: 29.9187 },
    Dakahlia: { lat: 31.0409, lng: 31.3785 },
    Gharbia: { lat: 30.8754, lng: 31.0335 },
    Qalyubia: { lat: 30.3292, lng: 31.2168 },
};

async function generateMedicationBarcode() {
    while (true) {
        const barcode = String(
            Math.floor(1000000000000 + Math.random() * 9000000000000)
        );

        const exists = await prisma.medicationBarcode.findUnique({
            where: { barcode },
        });

        if (!exists) {
            return barcode;
        }
    }
}

/* =========================
   SEED FUNCTION
========================= */

async function main() {
    console.log("Seeding started...");

    /* ADMIN */
    await prisma.admin.createMany({ data: admins });

    /* REGIONS */
    const regionRecords = await Promise.all(
        regions.map((name) =>
            prisma.region.create({ data: { name } })
        )
    );

    /* COMPANIES */
    const companyRecords = await Promise.all(
        companies.map((c) => prisma.medicationCompany.create({ data: c }))
    );

    /* CATEGORIES */
    const categoryRecords = await Promise.all(
        categories.map((name) =>
            prisma.medicationCategory.create({ data: { categoryName: name } })
        )
    );

    /* MEDICATIONS */
    const medicationRecords = [];

    for (const m of medications) {
        // Create medication
        const medication = await prisma.medication.create({
            data: {
                brandName: m.brandName,
                genericName: m.genericName,
                categoryId: categoryRecords[m.categoryIndex].id,
                companyId: companyRecords[m.companyIndex].id,
                unitPrice: m.unitPrice,
            },
        });

        medicationRecords.push(medication);

        // Create initial SKU barcode for medication
        await prisma.medicationBarcode.create({
            data: {
                medicationId: medication.id,
                barcode: await generateMedicationBarcode(),
            },
        });
    }

    /* PHARMACIES */
    let regionIndex = 0;

    await Promise.all(
        pharmacyNames.map((name, i) => {
            const region = regionRecords[regionIndex];

            const coords = egyptCoords[region.name];

            regionIndex = (regionIndex + 1) % regions.length;

            return prisma.pharmacy.create({
                data: {
                    regionId: region.id,
                    name: pharmacyNames[i],
                    email: `${formatPharmacyName(pharmacyNames[i])}@gmail.com`,
                    passwordHash: "pass123",
                    address: `${region.name} Center`,
                    latitude: coords.lat + Math.random() * 0.01,
                    longitude: coords.lng + Math.random() * 0.01,
                    currentStatus: "open",
                    accountStatus: "active",
                },
            });
        })
    );

    /* USERS - FREE (100) */
    const freeUsers = Array.from({ length: 100 }, (_, i) => ({
        userName: freeUsernames[i],
        email: `${freeUsernames[i]}@gmail.com`,
        passwordHash: "pass123",
        phoneNumber: `+20${1000000000 + i}`,
        accountType: "free",
    }));

    await prisma.endUser.createMany({ data: freeUsers });

    /* USERS - PAID (30 with geo) */
    const paidUsers = Array.from({ length: 30 }, (_, i) => {
        const city = regions[i % regions.length];
        const coords = egyptCoords[city];

        return {
            userName: paidUsernames[i],
            email: `${paidUsernames[i]}@gmail.com`,
            passwordHash: "pass123",
            phoneNumber: `+20${1010000000 + i}`,
            accountType: "paid",
            address: `${city} District`,
            latitude: coords.lat + Math.random() * 0.02,
            longitude: coords.lng + Math.random() * 0.02,
        };
    });

    await prisma.endUser.createMany({ data: paidUsers });

    console.log("Seeding completed successfully.");
}

function formatPharmacyName(name) {
    return name
        .replace(/\bPharmacy\b/i, "")   // remove "Pharmacy" word (case-insensitive)
        .trim()
        .split(/\s+/)                   // split by spaces
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");                      // join without spaces
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });