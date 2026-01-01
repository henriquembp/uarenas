# 🔧 Corrigir Erro de CORS

## ❌ Erro: "Not allowed by CORS"

O erro acontece porque o backend está bloqueando requisições do frontend do Vercel.

---

## 🔍 Causa

O backend está configurado para aceitar apenas origens específicas (definidas em `FRONTEND_URL`), mas a URL do Vercel não está na lista permitida.

---

## ✅ Solução: Adicionar URL do Vercel no Railway

### Passo 1: Descobrir a URL do Vercel

1. No Vercel Dashboard, encontre a URL do seu projeto
2. Será algo como: `https://seu-projeto.vercel.app`

### Passo 2: Adicionar no Railway

1. **No Railway Dashboard:**
   - Acesse o serviço **`uarena-code`** (backend)
   - Vá na aba **"Variables"**

2. **Encontre a variável `FRONTEND_URL`:**
   - Se já existe, edite
   - Se não existe, crie nova

3. **Configure o valor:**
   - Se já tem `http://localhost:3000`, adicione a URL do Vercel separada por vírgula:
   ```
   http://localhost:3000,https://seu-projeto.vercel.app
   ```
   
   - Ou se quiser só a URL do Vercel:
   ```
   https://seu-projeto.vercel.app
   ```

4. **Salve e aguarde o redeploy automático**

---

## 🔧 Alternativa: Modificar o Código (Mais Flexível)

Se quiser permitir qualquer origem (apenas para desenvolvimento/testes):

1. Edite `backend/src/main.ts`
2. Modifique a configuração de CORS para ser mais permissiva

**⚠️ ATENÇÃO:** Isso é menos seguro, use apenas para testes!

---

## 📋 Exemplo de Configuração

**No Railway → Variables → FRONTEND_URL:**

```
http://localhost:3000,https://seu-projeto.vercel.app
```

Ou múltiplas URLs separadas por vírgula:
```
http://localhost:3000,https://seu-projeto.vercel.app,https://outro-dominio.com
```

---

## ✅ Depois de Configurar

1. O Railway vai fazer redeploy automaticamente
2. Aguarde alguns segundos
3. Teste novamente no frontend do Vercel
4. O erro de CORS deve desaparecer!

---

## 🎯 Resumo

**Problema:** Backend bloqueando requisições do Vercel  
**Solução:** Adicionar URL do Vercel em `FRONTEND_URL` no Railway  
**Onde:** Railway Dashboard → uarena-code → Variables → FRONTEND_URL

---

**Qual é a URL do seu projeto no Vercel?** Me diga e eu te ajudo a configurar! 😊

