-- Script para verificar e corrigir o usuário

-- 1. Verificar se o usuário existe e tem organizationId
SELECT 
  u.id,
  u.email,
  u.name,
  u."organizationId",
  o.name as organization_name,
  o.id as organization_id
FROM users u
LEFT JOIN organizations o ON u."organizationId" = o.id
WHERE u.email = 'henriquembp@gmail.com';

-- 2. Se organizationId for NULL, atualizar
UPDATE users 
SET "organizationId" = '00000000-0000-0000-0000-000000000001'
WHERE email = 'henriquembp@gmail.com' 
AND ("organizationId" IS NULL OR "organizationId" = '');

-- 3. Verificar novamente após atualização
SELECT 
  u.id,
  u.email,
  u.name,
  u."organizationId",
  o.name as organization_name
FROM users u
LEFT JOIN organizations o ON u."organizationId" = o.id
WHERE u.email = 'henriquembp@gmail.com';

-- 4. Verificar se a organização padrão existe
SELECT * FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001';
