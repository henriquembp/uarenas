# 🚀 Configuração do Vercel

## ✅ Framework Preset

**Use:** **Next.js**

Seu frontend usa Next.js 14, então selecione o preset **"Next.js"** no Vercel.

---

## 📋 Configuração Passo a Passo

### 1. Framework Preset
- ✅ **Next.js** (selecione este)

### 2. Root Directory
- Se o repositório tem `frontend/` e `backend/` separados:
  - Configure **Root Directory:** `frontend`
- Se o repositório só tem o frontend:
  - Deixe em branco (raiz)

### 3. Build Command
- Deixe o padrão: `npm run build`
- Ou configure: `npm run build` (se estiver na pasta frontend)

### 4. Output Directory
- Deixe o padrão: `.next`
- Next.js já sabe onde colocar os arquivos

### 5. Install Command
- Deixe o padrão: `npm install`

---

## 🔧 Variáveis de Ambiente (IMPORTANTE!)

Após o deploy inicial, configure a variável de ambiente:

1. Vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Nome:** `NEXT_PUBLIC_API_URL`
   - **Valor:** `https://uarena.up.railway.app`
   - **Environment:** Production, Preview, Development (marque todos)

Isso faz o frontend se conectar ao backend do Railway!

---

## 📁 Estrutura do Repositório

Se seu repositório tem esta estrutura:
```
Arenas/
├── frontend/     ← Next.js está aqui
│   ├── app/
│   ├── package.json
│   └── ...
└── backend/      ← NestJS está aqui
    └── ...
```

**Configure:**
- **Root Directory:** `frontend`

---

## ✅ Checklist de Configuração

- [ ] Framework Preset: **Next.js**
- [ ] Root Directory: `frontend` (se aplicável)
- [ ] Build Command: `npm run build` (padrão)
- [ ] Output Directory: `.next` (padrão)
- [ ] Install Command: `npm install` (padrão)
- [ ] Variável `NEXT_PUBLIC_API_URL` = `https://uarena.up.railway.app`

---

## 🎯 Depois do Deploy

Após o primeiro deploy:

1. O Vercel vai gerar uma URL como: `https://seu-projeto.vercel.app`
2. Acesse: `https://seu-projeto.vercel.app/login`
3. A tela de login deve aparecer!

---

## 🐛 Problemas Comuns

### Erro: "Cannot find module"
- Verifique se o **Root Directory** está correto (`frontend`)

### Erro: "API URL not found"
- Verifique se a variável `NEXT_PUBLIC_API_URL` está configurada

### Erro de CORS
- Verifique se `FRONTEND_URL` no Railway inclui a URL do Vercel

---

Boa sorte com o deploy! 🚀

