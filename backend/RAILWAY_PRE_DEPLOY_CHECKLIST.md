# ✅ Checklist Antes do Deploy no Railway

## ⚠️ IMPORTANTE: Configure tudo abaixo ANTES de clicar em Deploy!

---

## 1️⃣ Variáveis de Ambiente (Aba "Variables")

No serviço `uarena-code`, vá em **"Variables"** e verifique/adicione:

### ✅ Obrigatórias:

- [ ] **`DATABASE_URL`** - Já deve estar configurada (criada automaticamente ao conectar serviços)
- [ ] **`JWT_SECRET`** - Adicione uma chave secreta forte
  - Exemplo: `minha-chave-super-secreta-123456789`
  - ⚠️ Use uma chave diferente da local!

### 📋 Opcionais (mas recomendadas):

- [ ] **`NODE_ENV`** = `production`
- [ ] **`PORT`** = `3001` (ou deixe o padrão do Railway)
- [ ] **`JWT_EXPIRES_IN`** = `7d`
- [ ] **`FRONTEND_URL`** = URL do seu frontend (se já tiver deployado)

---

## 2️⃣ Configurações de Build e Start (Aba "Settings")

No serviço `uarena-code`, vá em **"Settings"** e configure:

### ⚠️ CRÍTICO: Root Directory

Como seu repositório tem a estrutura:
```
uarenas/
  ├── backend/
  │   ├── src/
  │   ├── prisma/
  │   └── package.json
  └── frontend/
```

**Configure:**

- [ ] **Root Directory:** `backend`
  - Isso diz ao Railway onde está o `package.json` do backend

### Build Command:

- [ ] **Build Command:** 
  ```
  npm install && npm run prisma:generate && npm run build
  ```
  
  Ou use o script que criamos:
  ```
  npm install && npm run railway:build
  ```

### Start Command:

- [ ] **Start Command:**
  ```
  npm run prisma:migrate:deploy && npm run start:prod
  ```
  
  Ou use o script que criamos:
  ```
  npm run railway:start
  ```

---

## 3️⃣ Verificar Estrutura do Repositório

Certifique-se de que as migrations estão no repositório:

- [ ] A pasta `backend/prisma/migrations/` existe no GitHub
- [ ] As migrations foram commitadas e enviadas

**Verificar:**
```bash
git log --oneline
# Deve mostrar o commit das migrations
```

---

## 4️⃣ Verificar Conexão dos Serviços

- [ ] O serviço `uarena-code` está conectado ao `uarena-db`
- [ ] A variável `DATABASE_URL` aparece na lista de variáveis
- [ ] O serviço `uarena-db` está "Online"

---

## 5️⃣ Erros Comuns e Soluções

### ❌ Erro: "Cannot find module"
**Solução:** Verifique se o **Root Directory** está configurado como `backend`

### ❌ Erro: "DATABASE_URL not found"
**Solução:** 
1. Verifique se os serviços estão conectados
2. Vá em Variables e confirme que `DATABASE_URL` existe

### ❌ Erro: "No migrations found"
**Solução:**
1. Verifique se `backend/prisma/migrations/` está no repositório
2. Faça commit e push das migrations

### ❌ Erro: "JWT_SECRET is required"
**Solução:** Adicione a variável `JWT_SECRET` em Variables

### ❌ Erro: "Build failed"
**Solução:**
1. Verifique os logs do build
2. Confirme que o Build Command está correto
3. Verifique se o Root Directory está configurado

---

## 📝 Configuração Completa (Resumo)

### Variables:
```
DATABASE_URL = (automático ao conectar serviços)
JWT_SECRET = sua-chave-secreta-forte
NODE_ENV = production
PORT = 3001
JWT_EXPIRES_IN = 7d
FRONTEND_URL = (opcional, URL do frontend)
```

### Settings:
```
Root Directory: backend
Build Command: npm install && npm run prisma:generate && npm run build
Start Command: npm run prisma:migrate:deploy && npm run start:prod
```

---

## ✅ Depois de Configurar Tudo:

1. Clique em **"Deploy"** ou **"Deploy ↑+Enter"**
2. Vá em **"Logs"** para acompanhar o processo
3. Procure por:
   - ✅ `Prisma migrations applied successfully`
   - ✅ `🚀 Backend rodando na porta 3001`

---

## 🆘 Se Ainda Der Erro:

1. **Veja os logs completos** na aba "Logs"
2. **Copie a mensagem de erro** completa
3. **Verifique cada item do checklist** acima
4. **Confirme que fez push** das migrations para o GitHub

