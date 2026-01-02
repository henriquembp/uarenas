# 🏢 Multi-Tenancy para SaaS

## ❌ Situação Atual

O sistema atual **NÃO possui multi-tenancy**. Todos os dados estão em um único "pool" sem isolamento entre clientes.

**Problemas para SaaS:**
- ❌ Todos os clientes veem os mesmos dados
- ❌ Não há isolamento de dados entre arenas diferentes
- ❌ Impossível comercializar como SaaS multi-cliente

---

## ✅ O Que É Multi-Tenancy?

Multi-tenancy permite que múltiplos clientes (tenants) usem a mesma aplicação, mas com dados completamente isolados.

**Exemplo:**
- Arena A vê apenas suas quadras, reservas, alunos
- Arena B vê apenas suas quadras, reservas, alunos
- Arena C vê apenas suas quadras, reservas, alunos

---

## 🏗️ Arquiteturas de Multi-Tenancy

### Opção 1: Shared Database + Shared Schema (Recomendado para começar)

**Como funciona:**
- Um único banco de dados
- Todas as tabelas têm um campo `tenantId` (ou `organizationId`)
- Cada query filtra automaticamente por `tenantId`

**Vantagens:**
- ✅ Mais simples de implementar
- ✅ Mais fácil de manter
- ✅ Custo menor (um banco)
- ✅ Migrations mais simples

**Desvantagens:**
- ⚠️ Dados de todos os clientes no mesmo banco
- ⚠️ Precisa garantir isolamento em todas as queries

**Implementação:**
```prisma
model Organization {
  id        String   @id @default(uuid())
  name      String
  subdomain String   @unique // arena-a, arena-b
  createdAt DateTime @default(now())
  
  users     User[]
  courts    Court[]
  // ... todos os outros modelos
}

model Court {
  id             String   @id @default(uuid())
  organizationId String   // ← Campo de tenant
  name           String
  // ... resto dos campos
  
  organization   Organization @relation(fields: [organizationId], references: [id])
}
```

---

### Opção 2: Shared Database + Separate Schemas

**Como funciona:**
- Um banco de dados
- Cada tenant tem seu próprio schema (namespace)
- Exemplo: `arena_a.courts`, `arena_b.courts`

**Vantagens:**
- ✅ Isolamento mais forte
- ✅ Fácil fazer backup por tenant

**Desvantagens:**
- ⚠️ Mais complexo
- ⚠️ Migrations precisam rodar em todos os schemas
- ⚠️ Prisma não suporta nativamente

---

### Opção 3: Separate Databases

**Como funciona:**
- Cada tenant tem seu próprio banco de dados
- Conexão dinâmica baseada no tenant

**Vantagens:**
- ✅ Isolamento máximo
- ✅ Backup/restore por tenant
- ✅ Escalabilidade independente

**Desvantagens:**
- ⚠️ Muito mais complexo
- ⚠️ Custo maior (múltiplos bancos)
- ⚠️ Migrations em todos os bancos
- ⚠️ Gerenciamento complexo

---

## 🎯 Recomendação: Opção 1 (Shared Database + Shared Schema)

Para começar como SaaS, recomendo a **Opção 1** porque:
1. É mais simples de implementar
2. Você pode migrar depois se necessário
3. Custo menor no início
4. Prisma funciona perfeitamente

---

## 📋 O Que Precisa Ser Feito

### 1. Criar Modelo `Organization` (Tenant)

```prisma
model Organization {
  id        String   @id @default(uuid())
  name      String   // Nome da arena
  subdomain String   @unique // Para URLs: arena-a.uarenas.com
  domain    String?  @unique // Domínio customizado: arena-a.com.br
  plan      String   @default("free") // free, basic, premium
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  users     User[]
  courts    Court[]
  bookings  Booking[]
  classes   Class[]
  stores    Store[]
  // ... todos os outros modelos
}
```

### 2. Adicionar `organizationId` em Todos os Modelos

**Exemplo:**
```prisma
model Court {
  id             String   @id @default(uuid())
  organizationId String   // ← NOVO
  name           String
  // ... resto dos campos
  
  organization   Organization @relation(fields: [organizationId], references: [id])
}

model User {
  id             String   @id @default(uuid())
  organizationId String   // ← NOVO
  email          String
  // ... resto dos campos
  
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  @@unique([organizationId, email]) // Email único por organização
}
```

### 3. Middleware de Tenant no Backend

Criar um middleware/interceptor que:
- Identifica o tenant (via subdomain, header, ou JWT)
- Adiciona `organizationId` automaticamente em todas as queries
- Valida que o usuário pertence ao tenant correto

**Exemplo:**
```typescript
// middleware/tenant.middleware.ts
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Identifica tenant via subdomain
    const subdomain = req.headers.host?.split('.')[0];
    
    // Ou via header
    const tenantId = req.headers['x-tenant-id'];
    
    // Adiciona ao request
    req['tenantId'] = tenantId;
    next();
  }
}
```

### 4. Prisma Middleware para Filtro Automático

```typescript
// prisma.service.ts
prisma.$use(async (params, next) => {
  const tenantId = getTenantId(); // Do contexto da requisição
  
  // Adiciona filtro de tenant em todas as queries
  if (params.model && tenantId) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = {
        ...params.args.where,
        organizationId: tenantId,
      };
    }
  }
  
  return next(params);
});
```

### 5. Atualizar Autenticação

- JWT deve incluir `organizationId`
- Login deve identificar o tenant
- Validação de acesso ao tenant

---

## 🚀 Plano de Implementação

### Fase 1: Preparação (1-2 dias)
1. Criar modelo `Organization`
2. Criar migration para adicionar `organizationId` em todas as tabelas
3. Criar seed para organização padrão

### Fase 2: Backend (3-5 dias)
1. Criar middleware de tenant
2. Atualizar todos os services para filtrar por tenant
3. Atualizar autenticação para incluir tenant
4. Criar endpoints de gestão de organizações

### Fase 3: Frontend (2-3 dias)
1. Detectar subdomain
2. Passar tenantId nas requisições
3. Atualizar UI para multi-tenant
4. Criar tela de onboarding para novos tenants

### Fase 4: Testes (1-2 dias)
1. Testar isolamento de dados
2. Testar criação de novos tenants
3. Testar migração de dados existentes

---

## 📊 Migração de Dados Existentes

Se você já tem dados, precisa:

1. Criar uma organização padrão
2. Associar todos os dados existentes a essa organização
3. Atualizar todos os registros com `organizationId`

**SQL de migração:**
```sql
-- Criar organização padrão
INSERT INTO organizations (id, name, subdomain) 
VALUES ('default-org-id', 'Organização Padrão', 'default');

-- Associar dados existentes
UPDATE courts SET "organizationId" = 'default-org-id';
UPDATE users SET "organizationId" = 'default-org-id';
-- ... para todas as tabelas
```

---

## 💰 Modelo de Negócio SaaS

### Planos Sugeridos:

**Free:**
- 1 arena
- 2 quadras
- 50 reservas/mês
- Suporte por email

**Basic (R$ 99/mês):**
- 3 arenas
- 10 quadras
- Reservas ilimitadas
- Suporte prioritário

**Premium (R$ 299/mês):**
- Arenas ilimitadas
- Quadras ilimitadas
- Domínio customizado
- API access
- Suporte 24/7

---

## ⚠️ Considerações Importantes

### Segurança
- ✅ Sempre validar que o usuário pertence ao tenant
- ✅ Nunca confiar apenas no frontend
- ✅ Validar em todas as camadas (middleware, service, database)

### Performance
- ✅ Índices em `organizationId` em todas as tabelas
- ✅ Cache por tenant
- ✅ Rate limiting por tenant

### Escalabilidade
- ✅ Considerar sharding no futuro se crescer muito
- ✅ Monitorar uso por tenant
- ✅ Implementar quotas por plano

---

## 🎯 Próximos Passos

1. **Decidir arquitetura** (recomendo Opção 1)
2. **Criar modelo Organization**
3. **Criar migration** para adicionar `organizationId`
4. **Implementar middleware** de tenant
5. **Atualizar todos os services**
6. **Testar isolamento**

---

**Quer que eu implemente a estrutura básica de multi-tenancy?** 🚀
