# 🔧 Resolver Erro de Upload de Imagem

## ✅ Variável Configurada

A variável `NEXT_PUBLIC_API_URL` já está configurada no Vercel com o valor `https://uarena.up.railway.app`.

**Mas há um problema:** No Next.js, variáveis de ambiente `NEXT_PUBLIC_*` são injetadas **no momento do build**, não em runtime. Isso significa que você precisa fazer um **novo deploy** para que a variável seja aplicada.

---

## 🔄 Solução: Fazer Redeploy no Vercel

### Opção 1: Redeploy Manual (Mais Rápido)

1. Acesse: https://vercel.com
2. Selecione o projeto **"uarenas"**
3. Vá na aba **"Deployments"**
4. Clique nos **"..."** (três pontos) do último deployment
5. Selecione **"Redeploy"**
6. Aguarde o build completar

### Opção 2: Push Novamente (Automático)

Faça um pequeno commit e push para forçar um novo build:

```bash
git commit --allow-empty -m "chore: trigger redeploy to apply env vars"
git push origin main
```

---

## 🔍 Verificar se Está Funcionando

Após o redeploy:

1. **Aguarde o build completar** (pode levar 1-2 minutos)
2. **Acesse a aplicação** no Vercel
3. **Faça login**
4. **Vá em "Quadras"**
5. **Tente fazer upload de uma imagem**
6. **Abra o console do navegador (F12)** para ver se há erros

---

## 🐛 Outros Problemas Possíveis

### 1. Erro de CORS

Se ainda der erro após o redeploy, pode ser problema de CORS:

**Verificar no Railway:**
1. Acesse: https://railway.app
2. Selecione o serviço do backend
3. Vá em **"Variables"**
4. Verifique se `FRONTEND_URL` inclui a URL do Vercel:
   - Exemplo: `https://uarenas.vercel.app` (sem barra final)
   - Ou múltiplas URLs separadas por vírgula

### 2. Backend Não Está Rodando

Verifique se o backend está online:
1. Acesse: `https://uarena.up.railway.app/health`
2. Deve retornar: `{"status":"ok",...}`

### 3. Token de Autenticação

O upload requer autenticação. Verifique:
1. Se você está logado
2. Se o token está sendo enviado corretamente
3. Abra o console (F12) → Network → veja se o header `Authorization` está presente

---

## 🧪 Teste Manual

Para testar se o backend está funcionando:

1. **Abra o console do navegador (F12)**
2. **Vá na aba "Network"**
3. **Tente fazer upload de uma imagem**
4. **Veja a requisição que falhou:**
   - Qual é a URL completa?
   - Qual é o status code?
   - Qual é a mensagem de erro?

**URL esperada:** `https://uarena.up.railway.app/upload/image`

**Se a URL estiver errada:**
- A variável não foi aplicada → Faça redeploy

**Se a URL estiver correta mas der erro:**
- Pode ser CORS → Verifique `FRONTEND_URL` no Railway
- Pode ser autenticação → Verifique se está logado
- Pode ser backend offline → Verifique `/health`

---

## ✅ Checklist

- [ ] Variável `NEXT_PUBLIC_API_URL` configurada no Vercel ✅
- [ ] Redeploy feito após configurar a variável
- [ ] Backend está online (`/health` responde)
- [ ] `FRONTEND_URL` no Railway inclui URL do Vercel
- [ ] Usuário está logado
- [ ] Console do navegador não mostra erros de CORS

---

## 🎯 Próximos Passos

1. **Faça o redeploy no Vercel** (Opção 1 ou 2 acima)
2. **Aguarde o build completar**
3. **Teste novamente o upload**
4. **Se ainda não funcionar**, verifique os itens do checklist acima

---

**Após o redeploy, o upload deve funcionar!** 🚀
