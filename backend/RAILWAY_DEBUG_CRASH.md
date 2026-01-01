# 🔍 Debug: Servidor Crashando no Railway

## 🎯 O Problema

O deploy mostra "sucesso" inicialmente, mas depois fica "CRASHED". Isso significa:
- ✅ Build foi bem-sucedido
- ✅ Código compilou
- ❌ Servidor crashou ao iniciar

---

## 📋 Passo 1: Ver os Logs Detalhados

### Opção A: Aba "Logs" (Recomendado)

1. **No topo da tela**, clique na aba **"Logs"** (ao lado de "Architecture")
2. Você verá os logs em tempo real
3. **Procure pelas últimas linhas** antes do crash
4. **Copie as mensagens de erro** (geralmente em vermelho)

### Opção B: Aba "Deployments"

1. Na aba "Deployments" (onde você está)
2. Clique no deployment que está "CRASHED" (caixa vermelha)
3. Clique em **"View logs"** ou no botão de três pontos (⋯)
4. Veja os logs específicos desse deployment

---

## 🔍 Erros Comuns que Causam Crash

### 1. ❌ "DATABASE_URL is required" ou "Can't reach database"

**Causa:** Prisma não consegue conectar ao banco

**Solução:**
- ✅ Verifique se `DATABASE_URL` existe em Variables
- ✅ Verifique se os serviços estão conectados (`uarena-code` → `uarena-db`)
- ✅ Confirme que `uarena-db` está "Online"

### 2. ❌ "JWT_SECRET is required" ou "JWT_SECRET must be defined"

**Causa:** Variável de ambiente faltando

**Solução:**
- ✅ Vá em Variables
- ✅ Adicione `JWT_SECRET` com um valor qualquer
- ✅ Exemplo: `minha-chave-super-secreta-123456`

### 3. ❌ "Cannot find module '@prisma/client'"

**Causa:** Prisma Client não foi gerado

**Solução:**
- ✅ Verifique se o Build Command inclui `prisma generate`
- ✅ Build Command deve ser: `npm install && npm run prisma:generate && npm run build`

### 4. ❌ "EADDRINUSE: address already in use" ou erro de porta

**Causa:** Conflito de porta

**Solução:**
- ✅ O Railway define a porta automaticamente via `PORT`
- ✅ Não precisa configurar porta manualmente
- ✅ Se configurou `PORT` em Variables, remova ou deixe o Railway gerenciar

### 5. ❌ "Error: connect ECONNREFUSED" (banco de dados)

**Causa:** Não consegue conectar ao PostgreSQL

**Solução:**
- ✅ Verifique se `DATABASE_URL` está correta
- ✅ Verifique se o serviço `uarena-db` está Online
- ✅ Confirme que os serviços estão conectados

### 6. ❌ "Module not found" ou "Cannot find module"

**Causa:** Dependências não instaladas ou caminho errado

**Solução:**
- ✅ Verifique se Root Directory está como `backend`
- ✅ Verifique se Build Command inclui `npm install`

### 7. ❌ Erro de sintaxe TypeScript ou JavaScript

**Causa:** Erro no código

**Solução:**
- ✅ Veja os logs para identificar o arquivo e linha
- ✅ Teste localmente primeiro: `npm run build`

---

## ✅ Checklist Rápido

Antes de ver os logs, verifique:

- [ ] **Variables:**
  - [ ] `DATABASE_URL` existe
  - [ ] `JWT_SECRET` existe
  - [ ] `NODE_ENV` = `production` (opcional)

- [ ] **Settings:**
  - [ ] Root Directory = `backend`
  - [ ] Build Command = `npm install && npm run prisma:generate && npm run build`
  - [ ] Start Command = `npm run prisma:migrate:deploy && npm run start:prod`

- [ ] **Serviços:**
  - [ ] `uarena-code` conectado ao `uarena-db`
  - [ ] `uarena-db` está "Online"

---

## 🎯 Próximo Passo

1. **Vá na aba "Logs"** (topo da tela)
2. **Role até o final** dos logs
3. **Procure pela última mensagem de erro** antes do crash
4. **Copie a mensagem completa** e me envie

Com a mensagem de erro, posso te ajudar a resolver especificamente!

---

## 💡 Dica

Os logs do Railway mostram:
- **Build logs** (instalação, compilação)
- **Start logs** (inicialização do servidor)
- **Runtime logs** (erros durante execução)

O erro geralmente aparece nos **Start logs** ou **Runtime logs**.

