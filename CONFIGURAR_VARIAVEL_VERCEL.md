# 🔧 Configurar NEXT_PUBLIC_API_URL no Vercel

## ❌ Problema

O erro `Cannot POST /upload/image` ocorre porque a variável `NEXT_PUBLIC_API_URL` não está configurada no Vercel, então o frontend está tentando fazer requisições para `http://localhost:3001` (que não existe em produção).

---

## ✅ Solução: Configurar Variável de Ambiente no Vercel

### Passo 1: Obter a URL do Backend (Railway)

1. Acesse: https://railway.app
2. Selecione seu projeto
3. Selecione o serviço do backend (`uarena-code`)
4. Vá na aba **"Settings"**
5. Role até **"Networking"** ou **"Domains"**
6. Copie a URL pública (ex: `https://uarena.up.railway.app`)

**Ou verifique na aba "Deployments":**
- Clique no deployment mais recente
- Procure por **"Public Domain"** ou **"Custom Domain"**

### Passo 2: Configurar no Vercel

1. Acesse: https://vercel.com
2. Faça login na sua conta
3. Selecione o projeto **"uarenas"** (ou o nome do seu projeto)
4. Clique em **"Settings"** (menu superior)
5. No menu lateral, clique em **"Environment Variables"**

### Passo 3: Adicionar a Variável

1. Clique em **"+ Add New"** ou **"Add"**
2. Preencha:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** Cole a URL do Railway (ex: `https://uarena.up.railway.app`)
   - **Environment:** Marque todas as opções:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
3. Clique em **"Save"**

### Passo 4: Fazer Redeploy

Após adicionar a variável, você precisa fazer um redeploy para que ela seja aplicada:

**Opção A - Redeploy Manual:**
1. Vá para a aba **"Deployments"**
2. Clique nos **"..."** (três pontos) do último deployment
3. Selecione **"Redeploy"**

**Opção B - Push Novamente:**
- Faça um pequeno commit e push
- O Vercel detectará automaticamente e fará o deploy

---

## 🔍 Verificar se Está Funcionando

Após o redeploy:

1. Acesse a aplicação no Vercel
2. Faça login
3. Vá em "Quadras"
4. Tente fazer upload de uma imagem
5. Deve funcionar! ✅

---

## 📋 Exemplo de Configuração

```
Name: NEXT_PUBLIC_API_URL
Value: https://uarena.up.railway.app
Environment: Production, Preview, Development
```

**⚠️ IMPORTANTE:**
- Não inclua barra final (`/`) na URL
- Use `https://` (não `http://`)
- A URL deve ser acessível publicamente

---

## 🐛 Troubleshooting

### Erro persiste após configurar

1. ✅ Verifique se fez o redeploy após adicionar a variável
2. ✅ Verifique se a URL do Railway está correta e acessível
3. ✅ Abra o console do navegador (F12) e verifique se há erros de CORS
4. ✅ Verifique se `FRONTEND_URL` no Railway inclui a URL do Vercel

### Como verificar a URL no console

1. Abra o console do navegador (F12)
2. Digite: `console.log(process.env.NEXT_PUBLIC_API_URL)`
3. Deve mostrar a URL do Railway

---

## ✅ Checklist

- [ ] URL do Railway copiada
- [ ] Variável `NEXT_PUBLIC_API_URL` adicionada no Vercel
- [ ] Valor da variável = URL do Railway (sem barra final)
- [ ] Todas as environments marcadas (Production, Preview, Development)
- [ ] Redeploy feito
- [ ] Teste de upload funcionando

---

**Pronto!** Após configurar, o upload de imagens deve funcionar! 🚀
