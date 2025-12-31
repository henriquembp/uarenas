# 🔴 Problema: Container Parando Após Iniciar

## ❌ O Problema

O servidor inicia com sucesso (`🚀 Backend rodando na porta 3001`), mas logo depois aparece `Stopping Container`. Isso **NÃO é normal** - o servidor deveria continuar rodando indefinidamente.

## 🔍 Possíveis Causas

### 1. **JWT_SECRET não configurado**

Se `JWT_SECRET` não estiver nas variáveis de ambiente, o servidor pode crashar ao tentar inicializar o JWT.

**Solução:**
- Vá em **Variables** do `uarena-code`
- Adicione: `JWT_SECRET` = `sua-chave-secreta-forte-123456`

### 2. **Erro não capturado**

Algum erro está fazendo o processo crashar silenciosamente.

**Solução:**
- Veja os logs completos (role até o final)
- Procure por mensagens de erro ANTES de "Stopping Container"
- Procure por: `Error:`, `Failed:`, `Cannot`, etc.

### 3. **Prisma não consegue conectar**

Se o Prisma não conseguir conectar ao banco, pode causar crash.

**Solução:**
- Verifique se `DATABASE_URL` está configurada
- Verifique se `uarena-db` está "Online"
- Veja os logs para erros de conexão

### 4. **Railway Health Check**

O Railway pode estar matando o processo se não detectar que está "vivo".

**Solução:**
- Adicione um endpoint de health check (opcional)

---

## ✅ Checklist de Verificação

1. **Variables:**
   - [ ] `DATABASE_URL` existe
   - [ ] `JWT_SECRET` existe (⚠️ **MUITO IMPORTANTE**)
   - [ ] `NODE_ENV` = `production` (opcional)

2. **Logs:**
   - [ ] Veja TODOS os logs, não só o final
   - [ ] Procure por erros ANTES de "Stopping Container"
   - [ ] Procure por mensagens sobre JWT, Prisma, ou Database

3. **Serviços:**
   - [ ] `uarena-db` está "Online"
   - [ ] Serviços estão conectados

---

## 🔍 Como Ver os Logs Completos

1. Vá na aba **"Logs"**
2. **Role para CIMA** (não para baixo)
3. Procure por mensagens de erro
4. Procure especialmente por:
   - `JWT_SECRET`
   - `DATABASE_URL`
   - `Error:`
   - `Failed:`
   - `Cannot connect`

---

## 🎯 Próximo Passo

**O mais provável é que `JWT_SECRET` não esteja configurado.**

1. Vá em **Variables** do `uarena-code`
2. Adicione `JWT_SECRET` com qualquer valor (ex: `minha-chave-secreta-123456`)
3. Faça deploy novamente
4. Veja os logs para confirmar

Se ainda não funcionar, copie TODOS os logs (especialmente as últimas 50 linhas) e me envie.

