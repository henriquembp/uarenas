-- Script para verificar e corrigir Organization ID

-- 1. Verificar se a organização padrão existe
SELECT id, name, subdomain 
FROM organizations 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Se não existir, criar:
INSERT INTO organizations (id, name, subdomain, plan, "isActive", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Organização Padrão',
  'default',
  'FREE',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Verificar usuários sem organizationId
SELECT id, email, name, "organizationId" 
FROM users 
WHERE "organizationId" IS NULL;

-- 3. Atualizar usuários sem organizationId
UPDATE users 
SET "organizationId" = '00000000-0000-0000-0000-000000000001'
WHERE "organizationId" IS NULL;

-- 4. Verificar se o usuário específico tem organizationId
SELECT 
  u.id,
  u.email,
  u.name,
  u."organizationId",
  o.name as organization_name
FROM users u
LEFT JOIN organizations o ON u."organizationId" = o.id
WHERE u.email = 'henriquembp@gmail.com';

-- 5. Atualizar usuário específico (se necessário)
UPDATE users 
SET "organizationId" = '00000000-0000-0000-0000-000000000001'
WHERE email = 'henriquembp@gmail.com' 
AND ("organizationId" IS NULL OR "organizationId" = '');
