/*
  Warnings:

  - You are about to drop the column `requiredEmployees` on the `ShiftTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `requiredQualifications` on the `ShiftTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ShiftTemplate" DROP COLUMN "requiredEmployees",
DROP COLUMN "requiredQualifications",
ADD COLUMN     "staffing" JSONB NOT NULL DEFAULT '{}';
