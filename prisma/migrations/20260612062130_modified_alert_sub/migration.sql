/*
  Warnings:

  - A unique constraint covering the columns `[userId,medicationId,regionId]` on the table `StockAlertSubscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,medicationId,pharmacyId]` on the table `StockAlertSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StockAlertSubscription_userId_medicationId_regionId_key" ON "StockAlertSubscription"("userId", "medicationId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "StockAlertSubscription_userId_medicationId_pharmacyId_key" ON "StockAlertSubscription"("userId", "medicationId", "pharmacyId");
