# Configuração do Railway

## Passo a Passo para Conectar Prisma ao Banco do Railway

### 1. Conectar os Serviços no Railway

No painel do Railway:

1. **Clique no serviço `uarena-code`** (seu backend)
2. Vá na aba **"Variables"**
3. Você verá uma seção **"Reference Variables"** ou **"Connect Service"**
4. **Conecte o serviço `uarena-db`** (PostgreSQL)
5. O Railway automaticamente criará a variável `DATABASE_URL` com a conexão correta

### 2. Adicionar Variáveis de Ambiente

Na aba **"Variables"** do serviço `uarena-code`, adicione:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=sua-chave-secreta-super-forte-aqui
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://seu-frontend.vercel.app
```

**Importante:** 
- A `DATABASE_URL` será criada automaticamente quando você conectar os serviços
- Não precisa criar manualmente se você conectou os serviços

### 3. Configurar o Build e Start

No Railway, vá em **Settings** do serviço `uarena-code`:

**Build Command:**
```bash
npm run railway:build
```

**Start Command:**
```bash
npm run railway:start
```

Ou configure diretamente:
- **Root Directory:** `backend` (se seu repositório tem frontend e backend)
- **Build Command:** `cd backend && npm install && npm run prisma:generate && npm run build`
- **Start Command:** `cd backend && npm run prisma:migrate:deploy && npm run start:prod`

### 4. Como Funciona

Quando o Railway fizer o deploy:

1. **Build:**
   - Instala dependências (`npm install`)
   - Gera Prisma Client (`prisma generate`)
   - Compila TypeScript (`nest build`)

2. **Start:**
   - Aplica migrations no banco (`prisma migrate deploy`)
   - Inicia o servidor (`node dist/main`)

### 5. Verificar se Funcionou

Após o deploy:

1. Vá em **"Logs"** no Railway
2. Procure por mensagens como:
   - ✅ "Prisma migrations applied"
   - ✅ "🚀 Backend rodando na porta 3001"
3. Se houver erros, verifique:
   - Se `DATABASE_URL` está configurada
   - Se os serviços estão conectados
   - Se as migrations existem no repositório

### 6. Estrutura Esperada no Repositório

Certifique-se de que o repositório tem:

```
backend/
  ├── prisma/
  │   └── schema.prisma
  ├── prisma/
  │   └── migrations/  (criado após primeira migration local)
  │       └── ...
  ├── package.json
  └── src/
```

### 7. Primeira Migration

Se você ainda não criou migrations localmente:

```bash
# Localmente (desenvolvimento)
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
# Isso cria a pasta prisma/migrations/

# Commit e push
git add prisma/migrations
git commit -m "Add initial Prisma migrations"
git push
```

### Troubleshooting

**Erro: "No migrations found"**
- Certifique-se de que a pasta `prisma/migrations` existe no repositório
- Faça commit das migrations criadas localmente

**Erro: "Can't reach database"**
- Verifique se os serviços estão conectados no Railway
- Confirme que `DATABASE_URL` está nas variáveis de ambiente

**Erro: "Prisma Client not generated"**
- O script `postinstall` deve gerar automaticamente
- Verifique se `prisma` está em `dependencies` (não `devDependencies`)

