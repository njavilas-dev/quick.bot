/*
  Warnings:

  - The values [LIFETIME,OFFERED] on the enum `BillingPlanType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BillingPlanType_new" AS ENUM ('FREE', 'PERSONAL', 'BUSINESS', 'ENTERPRISE', 'UNLIMITED', 'CUSTOM');
ALTER TABLE "WorkspaceBillingPlan" ALTER COLUMN "key" DROP DEFAULT;
ALTER TABLE "WorkspaceBillingPlan" ALTER COLUMN "key" TYPE "BillingPlanType_new" USING ("key"::text::"BillingPlanType_new");
ALTER TYPE "BillingPlanType" RENAME TO "BillingPlanType_old";
ALTER TYPE "BillingPlanType_new" RENAME TO "BillingPlanType";
DROP TYPE "BillingPlanType_old";
ALTER TABLE "WorkspaceBillingPlan" ALTER COLUMN "key" SET DEFAULT 'FREE';
COMMIT;
