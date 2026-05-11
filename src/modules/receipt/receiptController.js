import { getReceipts,getReceiptsCount } from "./receiptService.js";

async function main(){
    const results = await getReceipts("758d9ceb-9caf-431c-bd7c-bee3012048ad");

    console.log(JSON.stringify(results, (_, value) =>
        typeof value === "bigint" ? value.toString() : value, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })