# 🏢 Como Cadastrar uma Nova Organização

## 📋 Métodos Disponíveis

### Método 1: Registro Público (Recomendado para SaaS) ⭐

**Endpoint:** `POST /organizations/register` (Público - não requer autenticação)

Este endpoint cria a organização E o primeiro usuário ADMIN automaticamente!

**Body:**
```json
{
  "name": "Arena Beach Tennis",
  "subdomain": "arena-beach",
  "domain": "arena-beach.com.br",  // Opcional
  "plan": "FREE",  // FREE, BASIC ou PREMIUM
  "adminEmail": "admin@arena-beach.com",
  "adminPassword": "senha123",
  "adminName": "Admin Arena Beach",
  "adminPhone": "48999116107"  // Opcional
}
```

**Exemplo com curl:**
```bash
curl -X POST http://localhost:3001/organizations/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arena Beach Tennis",
    "subdomain": "arena-beach",
    "plan": "FREE",
    "adminEmail": "admin@arena-beach.com",
    "adminPassword": "senha123",
    "adminName": "Admin Arena Beach"
  }'
```

**Resposta:**
```json
{
  "organization": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Arena Beach Tennis",
    "subdomain": "arena-beach",
    "plan": "FREE",
    "isActive": true,
    "createdAt": "2026-01-01T22:00:00.000Z",
    "updatedAt": "2026-01-01T22:00:00.000Z"
  },
  "admin": {
    "id": "user-id-here",
    "email": "admin@arena-beach.com",
    "name": "Admin Arena Beach",
    "role": "ADMIN",
    "organizationId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Vantagens:**
- ✅ Cria organização e admin em uma única requisição
- ✅ Não requer autenticação (público)
- ✅ Transação atômica (ou cria tudo ou nada)
- ✅ Valida subdomain e email únicos

---

### Método 2: Via API Protegida (Requer ADMIN)

**Endpoint:** `POST /organizations` (Protegido - requer token ADMIN)

**Headers:**
```
Authorization: Bearer SEU_TOKEN_JWT
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Arena Beach Tennis",
  "subdomain": "arena-beach",
  "domain": "arena-beach.com.br",  // Opcional
  "plan": "FREE"  // FREE, BASIC ou PREMIUM
}
```

**Exemplo com curl:**
```bash
curl -X POST http://localhost:3001/organizations \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arena Beach Tennis",
    "subdomain": "arena-beach",
    "plan": "FREE"
  }'
```

**Depois, crie o usuário ADMIN separadamente:**
```bash
POST /auth/register
{
  "email": "admin@arena-beach.com",
  "password": "senha123",
  "name": "Admin Arena Beach",
  "organizationId": "ID_DA_ORGANIZACAO_CRIADA"
}
```

---

### Método 3: Via Banco de Dados (SQL Direto)

```sql
INSERT INTO organizations (id, name, subdomain, plan, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Arena Beach Tennis',
  'arena-beach',
  'FREE',
  true,
  NOW(),
  NOW()
);
```

---

### Método 4: Via Prisma Studio

1. Execute: `npm run prisma:studio`
2. Acesse: http://localhost:5555
3. Selecione a tabela `organizations`
4. Clique em "Add record"
5. Preencha os campos e salve

---

## 📝 Campos Obrigatórios

**Para registro público (`/organizations/register`):**
- `name`: Nome da organização/arena
- `subdomain`: Subdomínio único (ex: `arena-beach`)
- `adminEmail`: Email do primeiro admin
- `adminPassword`: Senha do primeiro admin
- `adminName`: Nome do primeiro admin

**Campos Opcionais:**
- `domain`: Domínio customizado
- `plan`: FREE (padrão), BASIC ou PREMIUM
- `adminPhone`: Telefone do admin

**Para criação protegida (`/organizations`):**
- `name`: Nome da organização
- `subdomain`: Subdomínio único

---

## 🔍 Validações

O sistema valida automaticamente:
- ✅ Subdomain único (não pode repetir)
- ✅ Email único (não pode estar em uso em nenhuma organização)
- ✅ Formato de subdomain (letras, números, hífens)

---

## 🎯 Exemplo Completo - Registro Público

### Passo 1: Registrar Organização com Admin

```bash
POST http://localhost:3001/organizations/register
Content-Type: application/json

{
  "name": "Arena Beach Tennis",
  "subdomain": "arena-beach",
  "plan": "FREE",
  "adminEmail": "admin@arena-beach.com",
  "adminPassword": "senha123",
  "adminName": "João Silva",
  "adminPhone": "48999116107"
}
```

### Passo 2: Fazer Login com o Admin Criado

```bash
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@arena-beach.com",
  "password": "senha123",
  "organizationId": "ID_DA_ORGANIZACAO"  // Opcional, pode identificar pelo subdomain
}
```

**Resposta:**
```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "admin@arena-beach.com",
    "name": "João Silva",
    "role": "ADMIN",
    "organizationId": "org-id"
  }
}
```

### Passo 3: Usar o Token para Acessar a API

Agora você pode usar o token para acessar todos os endpoints da organização!

---

## ⚠️ Importante

1. **Subdomain deve ser único** - Escolha um nome único
2. **Email deve ser único** - Não pode estar em uso
3. **O primeiro usuário** é automaticamente ADMIN
4. **Dados isolados** - Cada organização só vê seus próprios dados

---

## 🚀 Pronto!

Após o registro:
- ✅ Organização criada
- ✅ Usuário ADMIN criado
- ✅ Pronto para usar!

**Faça login e comece a usar!** 🎉
