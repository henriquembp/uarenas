# 🔧 Corrigir CORS - Problema com Barra Final

## ❌ Problema Identificado

A `FRONTEND_URL` está configurada como:
```
https://uarenas.vercel.app/
```

**O problema:** A barra (`/`) no final pode causar problemas na comparação de CORS!

---

## ✅ Solução 1: Remover a Barra Final

1. **No Railway Dashboard:**
   - Acesse `uarena-code` → **Variables**
   - Edite a variável `FRONTEND_URL`
   - **Remova a barra final:**
   
   **De:**
   ```
   https://uarenas.vercel.app/
   ```
   
   **Para:**
   ```
   https://uarenas.vercel.app
   ```

2. **Salve** e aguarde o redeploy automático

---

## ✅ Solução 2: Melhorar o Código (Mais Robusto)

Se ainda não funcionar, vamos melhorar o código para normalizar as URLs (remover barras finais automaticamente):

**Edite `backend/src/main.ts`:**

```typescript
// Habilitar CORS
const frontendUrl = process.env.FRONTEND_URL;
const allowedOrigins = frontendUrl
  ? frontendUrl.split(',').map((url) => url.trim().replace(/\/$/, ''))
  : ['http://localhost:3000'];

app.enableCors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Normaliza a origin (remove barra final)
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

Isso remove barras finais automaticamente na comparação.

---

## 🔄 Forçar Redeploy

Se mudou a variável mas ainda não funcionou:

1. **No Railway Dashboard:**
   - Vá em **Deployments**
   - Clique nos **três pontos (...)** do deployment mais recente
   - Selecione **"Redeploy"**

Isso força um novo deploy com as variáveis atualizadas.

---

## 🧪 Teste

Depois de corrigir:

1. Aguarde o redeploy (alguns segundos)
2. Recarregue a página do Vercel: `https://uarenas.vercel.app/login`
3. Tente fazer login novamente
4. O erro de CORS deve desaparecer!

---

## 📋 Checklist

- [ ] Remover barra final da `FRONTEND_URL`: `https://uarenas.vercel.app` (sem `/`)
- [ ] Salvar a variável no Railway
- [ ] Aguardar redeploy automático (ou forçar manualmente)
- [ ] Testar novamente no Vercel

---

**Tente primeiro remover a barra final. Se ainda não funcionar, me avise e eu te ajudo a melhorar o código!** 😊

