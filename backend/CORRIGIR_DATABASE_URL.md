# 🔧 Corrigir DATABASE_URL no Railway

## Problema
Erro: `Can't reach database server at postgres.railway.internal:5432`

Isso significa que a `DATABASE_URL` não está configurada corretamente ou não está sendo passada para o comando.

---

## ✅ Solução: Verificar e Configurar DATABASE_URL

### Passo 1: Verificar DATABASE_URL no Railway

1. **No Railway Dashboard:**
   - Acesse o serviço **`uarena-code`** (seu backend)
   - Vá na aba **"Variables"**
   - Procure por **`DATABASE_URL`**

2. **Verificar se existe:**
   - Se **NÃO existe:** precisa criar
   - Se **existe:** verificar se está correta

---

### Passo 2: Como Criar/Configurar DATABASE_URL

**Opção A: Via Referência de Serviço (Recomendado)**

1. No serviço **`uarena-code`** → **Variables**
2. Clique em **"+ New Variable"**
3. Nome: `DATABASE_URL`
4. Valor: Clique no ícone de **"referência"** ou **"link"**
5. Selecione: **`uarena-db`** → **`DATABASE_URL`** ou **`POSTGRES_URL`**

Isso cria uma referência automática que sempre aponta para o banco correto.

**Opção B: Copiar URL Manualmente**

1. No serviço **`uarena-db`** (o banco) → **Variables**
2. Procure por **`DATABASE_URL`** ou **`POSTGRES_URL`**
3. Copie o valor completo (começa com `postgresql://...`)
4. No serviço **`uarena-code`** → **Variables**
5. Crie nova variável:
   - Nome: `DATABASE_URL`
   - Valor: Cole a URL que copiou

---

### Passo 3: Verificar o Formato da URL

A URL deve ter este formato:
```
postgresql://postgres:SENHA@HOST:PORTA/railway?sslmode=require
```

Exemplo:
```
postgresql://postgres:abc123@containers-us-west-123.railway.app:5432/railway?sslmode=require
```

**NÃO deve ser:**
- ❌ `postgres.railway.internal:5432` (URL interna que não funciona via CLI)
- ❌ URL sem `postgresql://` no início

---

### Passo 4: Executar Novamente

Depois de configurar a `DATABASE_URL`, execute:

```powershell
cd "C:\Trabalho\Repositorio Pessoal\Arenas\backend"
railway run npm run prisma:migrate:deploy
```

---

## 🔍 Alternativa: Usar URL Externa

Se a referência não funcionar, use a URL externa do banco:

1. No serviço **`uarena-db`** → **Settings** ou **Connect**
2. Procure por **"Public Network"** ou **"Connection String"**
3. Copie a URL externa
4. Use essa URL no serviço `uarena-code`

---

## ✅ Verificar se Funcionou

Depois de configurar, execute novamente:

```powershell
railway run npm run prisma:migrate:deploy
```

Deve aparecer:
```
✅ X migrations found in prisma/migrations
✅ Applying migration `20251231155914_uarena_mig`
✅ The following migration(s) have been applied:
```

Se ainda der erro, me diga qual é a mensagem! 😊

