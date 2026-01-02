# 🔧 Aplicar Migration de Organizations no Railway

## ⚠️ Problema

A tabela `organizations` não existe no banco do Railway, mas a coluna `organizationId` já foi criada na tabela `users`.

Isso significa que a migration foi aplicada parcialmente.

## ✅ Solução

### Opção 1: Executar SQL Manualmente (Recomendado)

1. **Acesse o banco de dados do Railway:**
   - No painel do Railway, vá até o serviço do banco de dados
   - Clique em "Connect" ou "Query"
   - Ou use um cliente SQL (pgAdmin, DBeaver, etc) com a `DATABASE_URL`

2. **Execute o script SQL:**
   - Abra o arquivo `backend/CRIAR_TABELA_ORGANIZATIONS.sql`
   - Copie todo o conteúdo
   - Cole e execute no banco de dados

3. **Verifique se funcionou:**
   ```sql
   SELECT * FROM organizations;
   ```
   
   Deve retornar pelo menos uma linha com a "Organização Padrão".

### Opção 2: Via Terminal do Railway

1. **Acesse o terminal do serviço backend no Railway**

2. **Execute:**
   ```bash
   cd backend
   npm run prisma:migrate:deploy
   ```

3. **Se der erro, tente forçar:**
   ```bash
   npx prisma migrate deploy --skip-seed
   ```

### Opção 3: Via Prisma Studio (Local)

1. **Configure a `DATABASE_URL` do Railway no seu `.env` local:**
   ```env
   DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
   ```

2. **Execute:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

---

## 🔍 Verificações

Após aplicar a migration, verifique:

1. **Tabela existe:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'organizations';
   ```

2. **Organização padrão existe:**
   ```sql
   SELECT * FROM organizations 
   WHERE id = '00000000-0000-0000-0000-000000000001';
   ```

3. **Foreign key está configurada:**
   ```sql
   SELECT 
       tc.constraint_name, 
       tc.table_name, 
       kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name 
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' 
   AND tc.table_name = 'users'
   AND kcu.column_name = 'organizationId';
   ```

---

## 🐛 Se Ainda Não Funcionar

1. **Verifique se há dados na tabela users:**
   ```sql
   SELECT COUNT(*), COUNT(DISTINCT "organizationId") 
   FROM users;
   ```

2. **Verifique se todos os users têm organizationId:**
   ```sql
   SELECT * FROM users WHERE "organizationId" IS NULL;
   ```

3. **Se houver users sem organizationId, atualize:**
   ```sql
   -- Primeiro, garanta que a organização padrão existe
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
   
   -- Depois, atualize os users sem organizationId
   UPDATE users 
   SET "organizationId" = '00000000-0000-0000-0000-000000000001'
   WHERE "organizationId" IS NULL;
   ```

---

## ✅ Após Aplicar

Reinicie o backend no Railway para garantir que o Prisma Client reconheça a nova tabela.
