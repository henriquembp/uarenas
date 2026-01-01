# 🔧 Como Corrigir o Root Directory no Vercel

## ❌ Problema

O Vercel está configurado para procurar o frontend em `Arenas/frontend`, mas após a reorganização do repositório, o frontend agora está em `frontend/`.

**Erro:**
```
The specified Root Directory "Arenas/frontend" does not exist.
```

---

## ✅ Solução: Atualizar Root Directory no Vercel

### Passo 1: Acessar as Configurações do Projeto

1. Acesse: https://vercel.com
2. Faça login na sua conta
3. Selecione o projeto **"uarenas"** (ou o nome do seu projeto)

### Passo 2: Acessar Project Settings

1. Clique em **"Settings"** (no menu superior)
2. No menu lateral esquerdo, clique em **"General"**

### Passo 3: Atualizar Root Directory

1. Role a página até a seção **"Root Directory"**
2. Você verá o campo com o valor atual: `Arenas/frontend`
3. **Altere para:** `frontend`
4. Clique em **"Save"** ou **"Update"**

### Passo 4: Fazer Redeploy

Após salvar, você pode:

**Opção A - Redeploy Manual:**
1. Vá para a aba **"Deployments"**
2. Clique nos **"..."** (três pontos) do último deployment
3. Selecione **"Redeploy"**

**Opção B - Push Novamente (Automático):**
- Faça um pequeno commit e push (ou apenas force um redeploy)
- O Vercel detectará automaticamente e fará o deploy

---

## 📋 Configuração Correta

Após a correção, a configuração deve ficar:

- **Root Directory:** `frontend`
- **Framework Preset:** Next.js (deve estar automático)
- **Build Command:** (deixar padrão do Next.js)
- **Output Directory:** (deixar padrão do Next.js)

---

## ✅ Verificação

Após o redeploy, verifique:

1. ✅ O build deve completar com sucesso
2. ✅ Não deve mais aparecer o erro de diretório não encontrado
3. ✅ A aplicação deve estar acessível na URL do Vercel

---

## 🎯 Resumo Rápido

1. Vercel → Settings → General
2. Root Directory: `Arenas/frontend` → `frontend`
3. Save
4. Redeploy

**Pronto!** 🚀
