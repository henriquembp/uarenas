# 🌐 Como Configurar FRONTEND_URL

## Onde o Frontend Está Hospedado?

A URL do frontend depende de onde você hospedou ele. Veja as opções:

### 1. **Vercel** (Mais comum para Next.js)
- URL será: `https://seu-projeto.vercel.app`
- Ou domínio customizado: `https://seudominio.com`

### 2. **Netlify**
- URL será: `https://seu-projeto.netlify.app`
- Ou domínio customizado: `https://seudominio.com`

### 3. **Railway** (se hospedar frontend também)
- URL será: `https://seu-projeto.up.railway.app`
- Ou domínio customizado se configurar

### 4. **Desenvolvimento Local**
- URL será: `http://localhost:3000` (padrão Next.js)

---

## Como Descobrir a URL do Frontend?

### Se já fez deploy:

1. **Vercel:**
   - Vá em https://vercel.com
   - Entre no seu projeto
   - A URL aparece no dashboard
   - Exemplo: `https://arenas-frontend.vercel.app`

2. **Netlify:**
   - Vá em https://app.netlify.com
   - Entre no seu projeto
   - A URL aparece no dashboard
   - Exemplo: `https://arenas-frontend.netlify.app`

3. **Railway:**
   - Vá no painel do Railway
   - Clique no serviço do frontend
   - A URL aparece na aba "Settings" ou "Deployments"
   - Exemplo: `https://uarena-frontend.up.railway.app`

### Se ainda não fez deploy:

Você pode:
1. **Fazer deploy primeiro** e depois configurar
2. **Usar localhost temporariamente** no Railway
3. **Deixar sem configurar** (o código tem fallback para localhost)

---

## Como Configurar no Railway?

### No Railway (Produção):

1. Vá no serviço `uarena-code`
2. Aba **"Variables"**
3. Adicione:
   - **VARIABLE_NAME:** `FRONTEND_URL`
   - **VALUE:** URL completa do seu frontend
     - Exemplo: `https://arenas-frontend.vercel.app`
     - Ou múltiplas URLs separadas por vírgula: `https://arenas-frontend.vercel.app,https://www.seudominio.com`

### No .env Local (Desenvolvimento):

```env
FRONTEND_URL="http://localhost:3000"
```

---

## Configuração para Múltiplos Ambientes

O código foi atualizado para aceitar múltiplas URLs separadas por vírgula:

```env
# Railway (Produção)
FRONTEND_URL="https://arenas-frontend.vercel.app,https://www.seudominio.com"

# Local (.env)
FRONTEND_URL="http://localhost:3000"
```

Isso é útil se você tem:
- Frontend em produção
- Frontend em staging
- Frontend local para testes

---

## Exemplo Prático:

### Cenário 1: Frontend no Vercel
```
Railway (uarena-code):
FRONTEND_URL = "https://arenas-app.vercel.app"
```

### Cenário 2: Frontend também no Railway
```
Railway (uarena-code):
FRONTEND_URL = "https://uarena-frontend.up.railway.app"
```

### Cenário 3: Ainda não tem frontend deployado
```
Railway (uarena-code):
FRONTEND_URL = "http://localhost:3000"  (temporário)
# Ou simplesmente não adiciona a variável
# O código usa localhost como fallback
```

---

## ⚠️ Importante:

1. **Não use `localhost` em produção** (só funciona localmente)
2. **Use HTTPS** em produção (Vercel, Netlify, Railway fornecem automaticamente)
3. **Sem barra no final** da URL (não use `https://site.com/`)
4. **Pode deixar vazio temporariamente** se ainda não fez deploy do frontend

---

## 🔍 Como Testar:

Depois de configurar, teste fazendo uma requisição do frontend para o backend:

```javascript
// No frontend
fetch('https://seu-backend.railway.app/api/courts')
  .then(res => res.json())
  .then(data => console.log(data));
```

Se der erro de CORS, verifique:
- ✅ A URL está correta no Railway?
- ✅ Não tem barra no final?
- ✅ Está usando HTTPS em produção?

---

## Resumo:

1. **Descubra a URL** do seu frontend (Vercel, Netlify, Railway, etc)
2. **Adicione no Railway** como variável `FRONTEND_URL`
3. **Para desenvolvimento local**, use `http://localhost:3000` no `.env`
4. **Pode deixar vazio** temporariamente se ainda não fez deploy do frontend

