-- Script para criar a tabela organizations no Railway
-- Execute este SQL diretamente no banco de dados do Railway

-- 1. Criar o enum OrganizationPlan se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrganizationPlan') THEN
        CREATE TYPE "OrganizationPlan" AS ENUM ('FREE', 'BASIC', 'PREMIUM');
    END IF;
END $$;

-- 2. Criar a tabela organizations
CREATE TABLE IF NOT EXISTS "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "domain" TEXT,
    "plan" "OrganizationPlan" NOT NULL DEFAULT 'FREE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- 3. Criar índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_subdomain_key" ON "organizations"("subdomain");
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_domain_key" ON "organizations"("domain") WHERE "domain" IS NOT NULL;

-- 4. Criar organização padrão para dados existentes
INSERT INTO "organizations" ("id", "name", "subdomain", "plan", "isActive", "createdAt", "updatedAt")
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Organização Padrão',
    'default',
    'FREE',
    true,
    NOW(),
    NOW()
)
ON CONFLICT ("id") DO NOTHING;

-- 5. Verificar se a foreign key já existe antes de criar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_organizationId_fkey'
    ) THEN
        ALTER TABLE "users" 
        ADD CONSTRAINT "users_organizationId_fkey" 
        FOREIGN KEY ("organizationId") 
        REFERENCES "organizations"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 6. Verificar se o índice já existe antes de criar
CREATE INDEX IF NOT EXISTS "users_organizationId_idx" ON "users"("organizationId");

-- 7. Verificar resultado
SELECT 
    'Tabela organizations criada com sucesso!' as status,
    COUNT(*) as total_organizations
FROM "organizations";
