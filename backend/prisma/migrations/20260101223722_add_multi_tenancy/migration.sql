-- CreateEnum
CREATE TYPE "OrganizationPlan" AS ENUM ('FREE', 'BASIC', 'PREMIUM');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "domain" TEXT,
    "plan" "OrganizationPlan" NOT NULL DEFAULT 'FREE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_subdomain_key" ON "organizations"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_domain_key" ON "organizations"("domain");

-- Criar organização padrão para dados existentes
INSERT INTO "organizations" ("id", "name", "subdomain", "plan", "isActive", "createdAt", "updatedAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'Organização Padrão', 'default', 'FREE', true, NOW(), NOW());

-- Adicionar organizationId como nullable primeiro
ALTER TABLE "users" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "courts" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "bookings" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "classes" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "invoices" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "stores" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "sales" ADD COLUMN "organizationId" TEXT;

-- Associar dados existentes à organização padrão
UPDATE "users" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "courts" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "bookings" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "classes" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "invoices" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "stores" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;
UPDATE "sales" SET "organizationId" = '00000000-0000-0000-0000-000000000001' WHERE "organizationId" IS NULL;

-- Tornar organizationId NOT NULL
ALTER TABLE "users" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "courts" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "classes" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "invoices" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "stores" ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE "sales" ALTER COLUMN "organizationId" SET NOT NULL;

-- Adicionar Foreign Keys
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "courts" ADD CONSTRAINT "courts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "classes" ADD CONSTRAINT "classes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stores" ADD CONSTRAINT "stores_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sales" ADD CONSTRAINT "sales_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Criar índices para performance
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");
CREATE INDEX "courts_organizationId_idx" ON "courts"("organizationId");
CREATE INDEX "bookings_organizationId_idx" ON "bookings"("organizationId");
CREATE INDEX "classes_organizationId_idx" ON "classes"("organizationId");
CREATE INDEX "invoices_organizationId_idx" ON "invoices"("organizationId");
CREATE INDEX "stores_organizationId_idx" ON "stores"("organizationId");
CREATE INDEX "sales_organizationId_idx" ON "sales"("organizationId");

-- Remover constraint unique antigo de email e criar novo com organizationId
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";
CREATE UNIQUE INDEX "users_organizationId_email_key" ON "users"("organizationId", "email");
