-- AlterTable
ALTER TABLE "court_availability" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "courts" ADD COLUMN     "defaultPrice" DECIMAL(10,2),
ADD COLUMN     "premiumPrice" DECIMAL(10,2);
