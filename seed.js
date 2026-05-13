import seedFixed from "./seed-fixed.js";
import seedSubRepMed from "./seed-sub-repMed.js";
import seedInventory from "./seed-inventory.js";
import seedPurchaseCycle from "./seed-purchase-cycle.js";
import seedReservation from "./seed-reserv.js";

async function run() {
    await seedFixed();
    await seedSubRepMed();
    await seedInventory();
    await seedPurchaseCycle();
    await seedReservation();
}

run()
    .catch(console.error)
    .finally(() => process.exit());