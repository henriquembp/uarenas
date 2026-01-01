# 🗄️ Como Executar Migrations no Railway

O problema: As migrations do Prisma não foram executadas no banco de dados do Railway.

## ✅ Solução: Executar Migrations Manualmente

### Opção 1: Via Railway CLI (Recomendado)

1. **Instale o Railway CLI** (se ainda não tem):
   ```bash
   npm i -g @railway/cli
   ```

2. **Faça login no Railway:**
   ```bash
   railway login
   ```

3. **Navegue até a pasta do backend:**
   ```bash
   cd backend
   ```

4. **Conecte ao projeto Railway:**
   ```bash
   railway link
   ```
   - Selecione o projeto `uarena`
   - Selecione o serviço `uarena-code`

5. **Execute as migrations:**
   ```bash
   railway run npm run prisma:migrate:deploy
   ```

   Isso executará as migrations no banco de dados do Railway.

---

### Opção 2: Via Railway Dashboard (One-Click Deploy)

1. **No Railway Dashboard:**
   - Acesse seu projeto
   - Clique no serviço `uarena-code`
   - Vá na aba **"Settings"**

2. **Procure por "Start Command" ou "Deploy Command":**
   - Deve estar algo como: `npm run start` ou `npm run railway:start`
   - Certifique-se de que está usando: `npm run railway:start`

3. **Se não estiver configurado:**
   - Altere para: `npm run railway:start`
   - Isso executará as migrations automaticamente em cada deploy

4. **Force um novo deploy:**
   - Vá na aba **"Deployments"**
   - Clique nos três pontos (...) do deployment mais recente
   - Selecione **"Redeploy"**

---

### Opção 3: Via Terminal do Railway (Web Console)

1. **No Railway Dashboard:**
   - Acesse seu projeto
   - Clique no serviço `uarena-code`
   - Vá na aba **"Settings"**
   - Procure por **"Connect"** ou **"Terminal"**

2. **Se houver terminal disponível:**
   ```bash
   cd /app  # ou onde o código está
   npm run prisma:migrate:deploy
   ```

---

### Opção 4: Verificar e Corrigir o Start Command

O Railway pode não estar executando o script correto. Vamos verificar:

1. **No Railway Dashboard:**
   - Acesse o serviço `uarena-code`
   - Vá em **Settings** → **Deploy**
   - Procure por **"Start Command"** ou **"Start Script"**

2. **Configure para:**
   ```
   npm run railway:start
   ```

3. **Ou configure como:**
   ```
   npm run prisma:migrate:deploy && npm run start:prod
   ```

4. **Salve e force um redeploy**

---

## 🔍 Verificar se as Migrations Estão no Repositório

As migrations precisam estar commitadas no Git para o Railway ter acesso a elas:

1. **Verifique se as migrations estão no repositório:**
   ```bash
   git ls-files backend/prisma/migrations/
   ```

2. **Se não estiverem, adicione-as:**
   ```bash
   git add backend/prisma/migrations/
   git commit -m "Add Prisma migrations"
   git push
   ```

3. **O Railway vai fazer um novo deploy automaticamente**

---

## ✅ Verificar se Funcionou

Depois de executar as migrations, teste:

1. **Health Check:**
   ```
   GET https://sua-url-railway.app/health
   ```
   ✅ Deve retornar 200 OK

2. **Registrar um usuário:**
   ```
   POST https://sua-url-railway.app/auth/register
   Body: {
     "email": "teste@example.com",
     "password": "senha123",
     "name": "Teste",
     "phone": "11999999999"
   }
   ```
   ✅ Deve retornar 201 Created (se antes dava erro, agora deve funcionar!)

3. **Fazer login:**
   ```
   POST https://sua-url-railway.app/auth/login
   Body: {
     "email": "teste@example.com",
     "password": "senha123"
   }
   ```
   ✅ Deve retornar 200 OK com o token

---

## 📋 Checklist

- [ ] Migrations estão no repositório Git
- [ ] Railway CLI instalado (se usar Opção 1)
- [ ] Start Command configurado como `npm run railway:start`
- [ ] Migrations executadas (via CLI ou redeploy)
- [ ] Teste de registro funciona
- [ ] Teste de login funciona

---

## 🐛 Problemas Comuns

### Erro: "Migration not found"
**Causa:** Migrations não estão no repositório ou não foram commitadas

**Solução:**
```bash
git add backend/prisma/migrations/
git commit -m "Add migrations"
git push
```

### Erro: "DATABASE_URL not found"
**Causa:** Variável de ambiente não configurada no Railway

**Solução:**
- No Railway Dashboard → Settings → Variables
- Verifique se `DATABASE_URL` está configurada
- Ela deve estar conectada ao serviço `uarena-db`

### Erro: "Connection refused"
**Causa:** Banco de dados não está rodando ou URL incorreta

**Solução:**
- Verifique se o serviço `uarena-db` está online
- Verifique se a `DATABASE_URL` está correta

---

## 💡 Dica Final

Para evitar esse problema no futuro, sempre certifique-se de que:

1. ✅ O script `railway:start` está configurado no Railway
2. ✅ As migrations são commitadas no Git antes do deploy
3. ✅ O Railway está usando o script correto (`npm run railway:start`)

---

Boa sorte! 🚀

