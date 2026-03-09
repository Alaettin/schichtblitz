/*
  Warnings:

  - The values [CASHIER] on the enum `Qualification` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Qualification_new" AS ENUM ('KITCHEN', 'SERVICE', 'BAR');
ALTER TABLE "Employee" ALTER COLUMN "qualifications" TYPE "Qualification_new"[] USING ("qualifications"::text::"Qualification_new"[]);
ALTER TYPE "Qualification" RENAME TO "Qualification_old";
ALTER TYPE "Qualification_new" RENAME TO "Qualification";
DROP TYPE "Qualification_old";
COMMIT;
