# 🌐 Usar URL Externa do Banco no Railway CLI

## Problema
A `DATABASE_URL` atual usa: `postgres.railway.internal:5432`

Essa é uma **URL interna** que só funciona dentro dos containers do Railway, **NÃO funciona** quando você executa comandos via Railway CLI no seu computador.

---

## ✅ Solução: Encontrar a URL Externa

### Passo 1: Encontrar a URL Externa do Banco

1. **No Railway Dashboard:**
   - Acesse o serviço **`uarena-db`** (não o `uarena-code`)
   - Vá na aba **"Settings"** ou **"Connect"**
   - Procure por **"Public Networking"** ou **"Connection"**

2. **Procurar por:**
   - **"Connection String"** ou **"Connection URL"**
   - **"Public URL"** ou **"External URL"**
   - **"Postgres Connection URL"**

3. **A URL externa deve ter este formato:**
   ```
   postgresql://postgres:SENHA@containers-us-west-XXX.railway.app:5432/railway
   ```
   
   **Ou:**
   ```
   postgresql://postgres:SENHA@[algum-dominio].railway.app:PORTA/railway
   ```

4. **NÃO é uma URL interna:**
   - ❌ `postgres.railway.internal` (interna - não funciona via CLI)
   - ✅ `containers-XXX.railway.app` (externa - funciona via CLI)

---

### Passo 2: Alternativa - Gerar URL Externa

Se não encontrar uma URL pública:

1. No serviço **`uarena-db`** → **Settings**
2. Procure por **"Networking"** ou **"Public Networking"**
3. Procure por **"Generate Public URL"** ou **"Expose Service"**
4. Ative o networking público

---

### Passo 3: Usar URL Externa Temporariamente no CLI

**Opção A: Definir variável no terminal (temporária)**

```powershell
cd "C:\Trabalho\Repositorio Pessoal\Arenas\backend"

# Defina a URL externa (substitua pela URL que você encontrou)
$env:DATABASE_URL="postgresql://postgres:SENHA@containers-XXX.railway.app:5432/railway"

# Execute as migrations
railway run npm run prisma:migrate:deploy
```

**Opção B: Criar arquivo .env temporário**

1. No backend, crie/edite `.env`
2. Adicione a URL externa:
   ```env
   DATABASE_URL="postgresql://postgres:SENHA@containers-XXX.railway.app:5432/railway"
   ```
3. Execute:
   ```powershell
   railway run npm run prisma:migrate:deploy
   ```

---

### Passo 4: IMPORTANTE - NÃO Alterar a URL no Railway

⚠️ **NÃO altere a `DATABASE_URL` no Railway Dashboard!**

- A URL `postgres.railway.internal` está **correta** para quando o código roda dentro do Railway
- Só precisamos usar a URL externa **temporariamente** para executar o comando via CLI

---

## 🎯 Resumo

1. ✅ Encontre a URL externa no serviço `uarena-db`
2. ✅ Use essa URL temporariamente no terminal (via variável de ambiente ou .env)
3. ✅ Execute: `railway run npm run prisma:migrate:deploy`
4. ✅ Depois, pode remover a URL temporária

---

**Você consegue encontrar a URL externa no serviço `uarena-db`?** 

Procure em:
- Settings → Networking
- Settings → Connect
- Ou na aba "Variables" do `uarena-db` (pode ter uma variável `POSTGRES_URL` ou similar)

