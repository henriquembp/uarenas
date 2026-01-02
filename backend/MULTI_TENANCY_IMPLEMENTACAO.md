# 🏢 Multi-Tenancy - Implementação Básica

## ✅ O Que Foi Implementado

### 1. Schema Prisma ✅
- ✅ Modelo `Organization` criado
- ✅ Enum `OrganizationPlan` (FREE, BASIC, PREMIUM)
- ✅ Campo `organizationId` adicionado em todos os modelos principais:
  - User
  - Court
  - Booking
  - Class
  - Invoice
  - Store
  - Sale
- ✅ Índices criados em `organizationId` para performance
- ✅ Constraints únicos atualizados (ex: `@@unique([organizationId, email])`)

### 2. Módulo de Organizações ✅
- ✅ `OrganizationsService` - CRUD de organizações
- ✅ `OrganizationsController` - Endpoints REST
- ✅ Integrado ao `AppModule`

### 3. Autenticação ✅
- ✅ JWT Strategy atualizado para incluir `organizationId`
- ✅ Auth Service atualizado para aceitar `organizationId`
- ✅ Login e Register atualizados

### 4. Tenant Interceptor ✅
- ✅ `TenantInterceptor` criado (pode identificar tenant via header ou subdomain)
- ✅ `Tenant` decorator criado

### 5. Services Atualizados (Parcial) ✅
- ✅ `CourtsService` atualizado para filtrar por `organizationId`
- ✅ `CourtsController` atualizado para usar `organizationId` do JWT
- ⚠️ Outros services ainda precisam ser atualizados

---

## ⚠️ Pendências

### 1. Migration do Banco de Dados

**Atenção:** Você precisa criar e executar uma migration para aplicar essas mudanças no banco!

```bash
cd backend
npm run prisma:migrate
```

**IMPORTANTE:** Como você já tem dados, a migration precisa:
1. Criar tabela `organizations`
2. Criar uma organização padrão
3. Adicionar coluna `organizationId` em todas as tabelas
4. Associar dados existentes à organização padrão

**SQL de migração manual (se necessário):**
```sql
-- 1. Criar organização padrão
INSERT INTO organizations (id, name, subdomain, plan) 
VALUES ('default-org-id', 'Organização Padrão', 'default', 'FREE');

-- 2. Adicionar organizationId em todas as tabelas
ALTER TABLE users ADD COLUMN "organizationId" TEXT;
ALTER TABLE courts ADD COLUMN "organizationId" TEXT;
ALTER TABLE bookings ADD COLUMN "organizationId" TEXT;
-- ... etc

-- 3. Associar dados existentes
UPDATE users SET "organizationId" = 'default-org-id';
UPDATE courts SET "organizationId" = 'default-org-id';
-- ... etc

-- 4. Tornar NOT NULL e adicionar FK
ALTER TABLE users ALTER COLUMN "organizationId" SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT "users_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES organizations(id);
-- ... etc
```

### 2. Services que Precisam Ser Atualizados

Os seguintes services ainda precisam filtrar por `organizationId`:
- ⚠️ `BookingsService`
- ⚠️ `ClassesService`
- ⚠️ `InvoicesService`
- ⚠️ `StoresService`
- ⚠️ `SalesService`
- ⚠️ `UsersService` (já parcialmente atualizado)

### 3. Frontend

O frontend precisa ser atualizado para:
- ⚠️ Enviar `organizationId` no login/register
- ⚠️ Usar subdomain para identificar tenant
- ⚠️ Passar `organizationId` nas requisições

---

## 🚀 Próximos Passos

### Passo 1: Criar e Executar Migration

```bash
cd backend
npm run prisma:migrate
# Nome da migration: add_multi_tenancy
```

### Passo 2: Criar Organização Padrão

Após a migration, crie uma organização padrão:

```typescript
// Seed ou script manual
const defaultOrg = await prisma.organization.create({
  data: {
    name: 'Organização Padrão',
    subdomain: 'default',
    plan: 'FREE',
  },
});
```

### Passo 3: Migrar Dados Existentes

Associe todos os dados existentes à organização padrão (veja SQL acima).

### Passo 4: Atualizar Outros Services

Siga o padrão do `CourtsService`:
- Adicionar `organizationId` como parâmetro
- Filtrar queries por `organizationId`
- Atualizar controllers para usar `req.user.organizationId`

### Passo 5: Testar

1. Criar uma organização
2. Criar um usuário nessa organização
3. Fazer login
4. Verificar que só vê dados da própria organização

---

## 📋 Estrutura de Arquivos Criados

```
backend/
├── src/
│   ├── organizations/
│   │   ├── organizations.module.ts
│   │   ├── organizations.service.ts
│   │   └── organizations.controller.ts
│   └── tenant/
│       ├── tenant.decorator.ts
│       └── tenant.interceptor.ts
└── prisma/
    └── schema.prisma (atualizado)
```

---

## 🔍 Como Funciona

1. **Identificação do Tenant:**
   - Via JWT: `req.user.organizationId` (principal)
   - Via Header: `X-Organization-Id` (opcional)
   - Via Subdomain: `arena-a.uarenas.com` → busca organization com subdomain "arena-a"

2. **Isolamento de Dados:**
   - Todas as queries filtram por `organizationId`
   - Cada organização só vê seus próprios dados

3. **Autenticação:**
   - JWT inclui `organizationId`
   - Validação garante que usuário pertence à organização

---

## ⚠️ IMPORTANTE

**NÃO faça deploy ainda!** 

Antes de fazer deploy:
1. ✅ Crie a migration
2. ✅ Teste localmente
3. ✅ Migre dados existentes
4. ✅ Atualize outros services
5. ✅ Teste tudo

Depois disso, pode fazer deploy!

---

**A estrutura básica está pronta! Agora é criar a migration e continuar atualizando os services.** 🚀
