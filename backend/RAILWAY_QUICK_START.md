# 🚀 Guia Rápido: Conectar Prisma ao Railway

## ✅ O que você já tem:
- ✅ Repositório no GitHub
- ✅ Serviço `uarena-code` (backend) no Railway
- ✅ Serviço `uarena-db` (PostgreSQL) no Railway

## 📋 Próximos Passos:

### 1️⃣ Conectar os Serviços (IMPORTANTE!)

No Railway:

1. Clique no serviço **`uarena-code`**
2. Vá na aba **"Variables"** (ou "Settings" > "Variables")
3. Procure por **"Connect Service"** ou **"Reference Variables"**
4. Selecione **`uarena-db`** (PostgreSQL)
5. O Railway automaticamente criará a variável `DATABASE_URL` ✅

**Isso é essencial!** Sem isso, o Prisma não consegue se conectar ao banco.

---

### 2️⃣ Adicionar Outras Variáveis

Na mesma aba **"Variables"** do `uarena-code`, adicione:

| Variável | Valor | Exemplo |
|----------|-------|---------|
| `NODE_ENV` | `production` | `production` |
| `PORT` | `3001` | `3001` |
| `JWT_SECRET` | Sua chave secreta | `minha-chave-super-secreta-123` |
| `JWT_EXPIRES_IN` | `7d` | `7d` |
| `FRONTEND_URL` | URL do seu frontend | `https://seu-app.vercel.app` |

**⚠️ Não crie `DATABASE_URL` manualmente!** Ela será criada automaticamente quando você conectar os serviços.

---

### 3️⃣ Configurar Build e Start

No Railway, no serviço `uarena-code`:

**Vá em Settings** e configure:

#### Se seu repositório tem pasta `backend/`:
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run prisma:generate && npm run build`
- **Start Command:** `npm run prisma:migrate:deploy && npm run start:prod`

#### Se seu repositório é só o backend:
- **Build Command:** `npm install && npm run prisma:generate && npm run build`
- **Start Command:** `npm run prisma:migrate:deploy && npm run start:prod`

---

### 4️⃣ Criar Primeira Migration (se ainda não fez)

**Localmente no seu computador:**

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
# Digite um nome para a migration, ex: "init"
```

Isso cria a pasta `prisma/migrations/` com as tabelas.

**Depois, faça commit:**

```bash
git add prisma/migrations
git commit -m "Add initial Prisma migrations"
git push
```

---

### 5️⃣ Fazer Deploy

No Railway:

1. Clique em **"Deploy"** ou **"Deploy ↑+Enter"**
2. O Railway vai:
   - Fazer build do código
   - Gerar Prisma Client
   - Aplicar migrations no banco
   - Iniciar o servidor

---

### 6️⃣ Verificar se Funcionou

1. Vá em **"Logs"** no Railway
2. Procure por:
   - ✅ `Prisma migrations applied successfully`
   - ✅ `🚀 Backend rodando na porta 3001`
3. Se aparecer erros, verifique:
   - Se os serviços estão conectados
   - Se `DATABASE_URL` existe nas variáveis
   - Se as migrations estão no repositório

---

## 🔍 Como o Prisma se Conecta?

```
┌─────────────────┐
│  Railway        │
│                 │
│  uarena-code    │─── lê ───> DATABASE_URL (variável de ambiente)
│  (Backend)      │
│                 │
│  Prisma Client  │─── usa ───> DATABASE_URL
│                 │
│  prisma migrate │─── conecta ───> uarena-db (PostgreSQL)
│  deploy         │
└─────────────────┘
```

O Prisma lê a variável `DATABASE_URL` que o Railway cria automaticamente quando você conecta os serviços.

---

## ❓ Problemas Comuns

### "Can't reach database"
- ✅ Verifique se conectou os serviços no Railway
- ✅ Confirme que `DATABASE_URL` existe nas variáveis

### "No migrations found"
- ✅ Certifique-se de que `prisma/migrations/` está no repositório
- ✅ Faça commit e push das migrations

### "Prisma Client not generated"
- ✅ O script `postinstall` deve gerar automaticamente
- ✅ Verifique os logs do build no Railway

---

## 🎯 Resumo

1. **Conecte** `uarena-code` → `uarena-db` no Railway
2. **Adicione** variáveis de ambiente (JWT_SECRET, etc)
3. **Configure** Build e Start commands
4. **Crie** migrations localmente e faça commit
5. **Deploy** no Railway
6. **Verifique** os logs

Pronto! 🎉

