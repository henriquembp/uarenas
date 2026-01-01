# 🔗 Construir URL Externa do Banco

## ✅ Encontramos a URL Pública!

Na tela que você mostrou, a URL pública é:
- **Host:** `caboose.proxy.rlwy.net`
- **Porta:** `54471` (não 5432, que é interna)

---

## 📝 Como Construir a DATABASE_URL Completa

Você precisa pegar a senha da URL atual e construir uma nova URL usando o host e porta externos.

### Passo 1: Pegar a Senha da URL Atual

A sua URL atual é:
```
postgresql://postgres:aEPuWiqlMeAifEONSozgGlvsIKgfMvRz@postgres.railway.internal:5432/railway
```

A senha é: `aEPuWiqlMeAifEONSozgGlvsIKgfMvRz`

### Passo 2: Construir a Nova URL Externa

Use este formato:
```
postgresql://postgres:SENHA@caboose.proxy.rlwy.net:54471/railway
```

Substitua `SENHA` pela senha que você tem.

**URL completa:**
```
postgresql://postgres:aEPuWiqlMeAifEONSozgGlvsIKgfMvRz@caboose.proxy.rlwy.net:54471/railway
```

---

## 🚀 Executar as Migrations

Agora execute no terminal:

```powershell
cd "C:\Trabalho\Repositorio Pessoal\Arenas\backend"

# Defina a URL externa (use a URL completa acima)
$env:DATABASE_URL="postgresql://postgres:aEPuWiqlMeAifEONSozgGlvsIKgfMvRz@caboose.proxy.rlwy.net:54471/railway"

# Execute as migrations
railway run npm run prisma:migrate:deploy
```

---

## ⚠️ Importante

- Use a porta **54471** (não 5432)
- Use o host **caboose.proxy.rlwy.net** (não postgres.railway.internal)
- Mantenha a senha original
- Isso é apenas temporário para executar o comando via CLI

---

Execute o comando acima e me diga se funcionou! 🚀

