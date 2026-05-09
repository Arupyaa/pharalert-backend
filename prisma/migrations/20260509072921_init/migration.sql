-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "AdjustmentReason" AS ENUM ('PURCHASE', 'ORDER', 'LOST', 'DAMAGED', 'MANUAL_ADJUSTMENT', 'OPENING_STOCK');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('pending', 'rejected', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "PharmacyStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('not_paid', 'processing_installments', 'fully_paid');

-- CreateEnum
CREATE TYPE "DemandType" AS ENUM ('PURCHASED', 'REPLACEMENT_ACCEPTED', 'REPLACEMENT_REFUSED', 'NO_ACTION');

-- CreateEnum
CREATE TYPE "UserAccountType" AS ENUM ('free', 'paid');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('pending', 'delivered');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pharmacy" (
    "id" TEXT NOT NULL,
    "regionId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "openingHour" TEXT,
    "closingHour" TEXT,
    "currentStatus" "PharmacyStatus" NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Pharmacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationCompany" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EndUser" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "accountType" "UserAccountType" NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EndUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" BIGSERIAL NOT NULL,
    "pharmacyId" TEXT,
    "companyId" TEXT,
    "userId" TEXT,
    "planName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationCategory" (
    "id" BIGSERIAL NOT NULL,
    "categoryName" TEXT NOT NULL,

    CONSTRAINT "MedicationCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" BIGSERIAL NOT NULL,
    "brandName" TEXT NOT NULL,
    "genericName" TEXT NOT NULL,
    "categoryId" BIGINT NOT NULL,
    "companyId" TEXT NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationBarcode" (
    "id" BIGINT NOT NULL,
    "barcode" TEXT NOT NULL,
    "medicationId" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "MedicationReplacement" (
    "id" BIGSERIAL NOT NULL,
    "medicationId" BIGINT NOT NULL,
    "replacementMedicationId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationReplacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyInventory" (
    "id" BIGSERIAL NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "medicationId" BIGINT NOT NULL,
    "stock" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PharmacyInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAdjustment" (
    "id" BIGSERIAL NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "medicationId" BIGINT NOT NULL,
    "adjustmentType" "AdjustmentType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" "AdjustmentReason" NOT NULL,
    "notes" TEXT,
    "referenceOrderId" BIGINT,
    "referencePurchaseId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" BIGSERIAL NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "supplierCompanyId" TEXT NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" BIGSERIAL NOT NULL,
    "orderId" BIGINT NOT NULL,
    "medicationId" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "medicationDiscount" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" BIGSERIAL NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseItem" (
    "id" BIGSERIAL NOT NULL,
    "purchaseId" BIGINT NOT NULL,
    "medicationId" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "medicationDiscount" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "PurchaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" BIGSERIAL NOT NULL,
    "purchaseId" BIGINT,
    "orderId" BIGINT,
    "paymentAmount" DECIMAL(65,30) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "installmentNumber" INTEGER,
    "notes" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandLog" (
    "id" BIGSERIAL NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "medicationId" BIGINT NOT NULL,
    "demandType" "DemandType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemandLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Replacement" (
    "id" BIGSERIAL NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "medicationReplacementId" BIGINT NOT NULL,
    "customerName" TEXT NOT NULL,
    "isAccepted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Replacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationItem" (
    "id" BIGSERIAL NOT NULL,
    "reservationId" BIGINT NOT NULL,
    "medicationId" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ReservationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rejection" (
    "id" BIGSERIAL NOT NULL,
    "pharmacyId" TEXT,
    "companyId" TEXT,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rejection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAlertSubscription" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "medicationId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StockAlertSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Region_name_idx" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_email_key" ON "Pharmacy"("email");

-- CreateIndex
CREATE INDEX "Pharmacy_regionId_idx" ON "Pharmacy"("regionId");

-- CreateIndex
CREATE INDEX "Pharmacy_name_idx" ON "Pharmacy"("name");

-- CreateIndex
CREATE INDEX "Pharmacy_accountStatus_idx" ON "Pharmacy"("accountStatus");

-- CreateIndex
CREATE UNIQUE INDEX "MedicationCompany_email_key" ON "MedicationCompany"("email");

-- CreateIndex
CREATE INDEX "MedicationCompany_companyName_idx" ON "MedicationCompany"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "EndUser_userName_key" ON "EndUser"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "EndUser_email_key" ON "EndUser"("email");

-- CreateIndex
CREATE INDEX "EndUser_accountType_idx" ON "EndUser"("accountType");

-- CreateIndex
CREATE INDEX "EndUser_phoneNumber_idx" ON "EndUser"("phoneNumber");

-- CreateIndex
CREATE INDEX "Subscription_pharmacyId_idx" ON "Subscription"("pharmacyId");

-- CreateIndex
CREATE INDEX "Subscription_companyId_idx" ON "Subscription"("companyId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_planName_idx" ON "Subscription"("planName");

-- CreateIndex
CREATE INDEX "Medication_categoryId_idx" ON "Medication"("categoryId");

-- CreateIndex
CREATE INDEX "Medication_companyId_idx" ON "Medication"("companyId");

-- CreateIndex
CREATE INDEX "Medication_brandName_idx" ON "Medication"("brandName");

-- CreateIndex
CREATE UNIQUE INDEX "MedicationBarcode_barcode_key" ON "MedicationBarcode"("barcode");

-- CreateIndex
CREATE INDEX "MedicationBarcode_medicationId_idx" ON "MedicationBarcode"("medicationId");

-- CreateIndex
CREATE INDEX "MedicationReplacement_medicationId_idx" ON "MedicationReplacement"("medicationId");

-- CreateIndex
CREATE INDEX "MedicationReplacement_replacementMedicationId_idx" ON "MedicationReplacement"("replacementMedicationId");

-- CreateIndex
CREATE INDEX "PharmacyInventory_pharmacyId_idx" ON "PharmacyInventory"("pharmacyId");

-- CreateIndex
CREATE INDEX "PharmacyInventory_medicationId_idx" ON "PharmacyInventory"("medicationId");

-- CreateIndex
CREATE INDEX "Order_pharmacyId_idx" ON "Order"("pharmacyId");

-- CreateIndex
CREATE INDEX "Order_supplierCompanyId_idx" ON "Order"("supplierCompanyId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_medicationId_idx" ON "OrderItem"("medicationId");

-- CreateIndex
CREATE INDEX "Purchase_pharmacyId_idx" ON "Purchase"("pharmacyId");

-- CreateIndex
CREATE INDEX "PurchaseItem_purchaseId_idx" ON "PurchaseItem"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseItem_medicationId_idx" ON "PurchaseItem"("medicationId");

-- CreateIndex
CREATE INDEX "Payment_purchaseId_idx" ON "Payment"("purchaseId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "DemandLog_pharmacyId_idx" ON "DemandLog"("pharmacyId");

-- CreateIndex
CREATE INDEX "DemandLog_medicationId_idx" ON "DemandLog"("medicationId");

-- CreateIndex
CREATE INDEX "Replacement_pharmacyId_idx" ON "Replacement"("pharmacyId");

-- CreateIndex
CREATE INDEX "Replacement_medicationReplacementId_idx" ON "Replacement"("medicationReplacementId");

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE INDEX "ReservationItem_reservationId_idx" ON "ReservationItem"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationItem_medicationId_idx" ON "ReservationItem"("medicationId");

-- CreateIndex
CREATE INDEX "Rejection_pharmacyId_idx" ON "Rejection"("pharmacyId");

-- CreateIndex
CREATE INDEX "Rejection_companyId_idx" ON "Rejection"("companyId");

-- CreateIndex
CREATE INDEX "StockAlertSubscription_userId_idx" ON "StockAlertSubscription"("userId");

-- CreateIndex
CREATE INDEX "StockAlertSubscription_medicationId_idx" ON "StockAlertSubscription"("medicationId");

-- AddForeignKey
ALTER TABLE "Pharmacy" ADD CONSTRAINT "Pharmacy_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "MedicationCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "EndUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MedicationCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "MedicationCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationBarcode" ADD CONSTRAINT "MedicationBarcode_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationReplacement" ADD CONSTRAINT "MedicationReplacement_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationReplacement" ADD CONSTRAINT "MedicationReplacement_replacementMedicationId_fkey" FOREIGN KEY ("replacementMedicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyInventory" ADD CONSTRAINT "PharmacyInventory_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyInventory" ADD CONSTRAINT "PharmacyInventory_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_referenceOrderId_fkey" FOREIGN KEY ("referenceOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_referencePurchaseId_fkey" FOREIGN KEY ("referencePurchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_supplierCompanyId_fkey" FOREIGN KEY ("supplierCompanyId") REFERENCES "MedicationCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseItem" ADD CONSTRAINT "PurchaseItem_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandLog" ADD CONSTRAINT "DemandLog_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandLog" ADD CONSTRAINT "DemandLog_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Replacement" ADD CONSTRAINT "Replacement_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Replacement" ADD CONSTRAINT "Replacement_medicationReplacementId_fkey" FOREIGN KEY ("medicationReplacementId") REFERENCES "MedicationReplacement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "EndUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationItem" ADD CONSTRAINT "ReservationItem_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationItem" ADD CONSTRAINT "ReservationItem_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rejection" ADD CONSTRAINT "Rejection_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rejection" ADD CONSTRAINT "Rejection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "MedicationCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlertSubscription" ADD CONSTRAINT "StockAlertSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "EndUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlertSubscription" ADD CONSTRAINT "StockAlertSubscription_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
