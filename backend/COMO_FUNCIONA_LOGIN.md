# 🔐 Como Funciona o Login

## 📋 Arquitetura

### ✅ Usuário Vinculado à Organização

**SIM!** Cada usuário já está vinculado a uma organização no banco de dados através do campo `organizationId` na tabela `users`.

### 🎯 Tela de Login Única

A tela de login é **única** e **simples**:
- Apenas **email** e **senha**
- **Não precisa** informar organização, subdomain ou qualquer outro campo

### 🔍 Identificação Automática

O sistema identifica **automaticamente** a organização do usuário pelo email:

1. Usuário digita **email** e **senha**
2. Sistema busca o usuário pelo **email** no banco
3. O usuário já tem `organizationId` vinculado
4. Sistema retorna o token JWT com `organizationId` incluído
5. Todas as requisições subsequentes usam o `organizationId` do token

---

## 📝 Exemplo de Login

### Request
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@arena-beach.com",
  "password": "senha123"
}
```

### Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "admin@arena-beach.com",
    "name": "Admin Arena Beach",
    "role": "ADMIN",
    "organizationId": "org-id-da-arena-beach"
  }
}
```

---

## 🔒 Segurança

### Email Único por Organização

No schema Prisma, temos:
```prisma
@@unique([organizationId, email])
```

Isso significa:
- ✅ Um email pode existir em **diferentes organizações**
- ✅ Mas dentro da **mesma organização**, o email é **único**

### Busca do Usuário

O sistema busca o usuário pelo email:
- Se houver múltiplos usuários com o mesmo email em organizações diferentes, retorna o **primeiro encontrado**
- Em um SaaS real, você pode querer usar **subdomain** na URL para identificar a organização antes do login

---

## 🌐 Opção: Login por Subdomain (Futuro)

Se quiser implementar login por subdomain (ex: `arena-beach.uarenas.com`):

1. **Frontend**: Identifica o subdomain da URL
2. **Backend**: Busca organização pelo subdomain
3. **Login**: Valida que o usuário pertence àquela organização

**Exemplo:**
```
URL: https://arena-beach.uarenas.com/login
→ Subdomain: arena-beach
→ Busca organização pelo subdomain
→ Valida que o usuário pertence à organização encontrada
```

---

## 📚 Collection do Postman

A collection foi atualizada para usar apenas:
```json
{
  "email": "usuario@test.com",
  "password": "senha123"
}
```

**Não precisa mais passar `organizationId` ou `subdomain`!** ✅

---

## 🎯 Resumo

- ✅ Usuário **já está vinculado** à organização
- ✅ Login **simples**: apenas email e senha
- ✅ Sistema **identifica automaticamente** a organização
- ✅ Token JWT **inclui organizationId**
- ✅ Todas as requisições **filtram por organizationId** automaticamente

**Pronto para usar!** 🚀
