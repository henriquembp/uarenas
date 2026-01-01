# 🧪 Testar a API pelo Frontend

## ✅ Sim! Você pode testar pelo frontend

O frontend já está configurado para se conectar ao backend. Só precisa configurar a URL da API.

---

## 🚀 Como Testar

### Opção 1: Teste Local (Backend Local + Frontend Local)

#### 1. Configure o Frontend:

Crie um arquivo `.env.local` na pasta `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 2. Inicie o Backend:

```bash
cd backend
npm run start:dev
```

O backend vai rodar em `http://localhost:3001`

#### 3. Inicie o Frontend:

```bash
cd frontend
npm install  # Se ainda não instalou
npm run dev
```

O frontend vai rodar em `http://localhost:3000`

#### 4. Teste:

1. Abra `http://localhost:3000/login`
2. Clique em "Não tem conta? Cadastre-se"
3. Preencha os dados e cadastre
4. Faça login
5. Você será redirecionado para o dashboard

---

### Opção 2: Teste com Backend no Railway

#### 1. Descubra a URL do Railway:

No Railway:
- Vá no serviço `uarena-code`
- Aba "Settings" ou "Deployments"
- Procure "Public Domain" ou "Generate Domain"
- URL será algo como: `https://uarena-code-production.up.railway.app`

#### 2. Configure o Frontend:

Crie um arquivo `.env.local` na pasta `frontend/`:

```env
NEXT_PUBLIC_API_URL=https://SUA-URL-RAILWAY
```

**Exemplo:**
```env
NEXT_PUBLIC_API_URL=https://uarena-code-production.up.railway.app
```

#### 3. Inicie o Frontend:

```bash
cd frontend
npm run dev
```

#### 4. Teste:

1. Abra `http://localhost:3000/login`
2. Cadastre um usuário
3. Faça login
4. Teste as funcionalidades do dashboard

---

## 📋 Checklist de Testes pelo Frontend

### ✅ Teste 1: Cadastro de Usuário
1. Vá em `/login`
2. Clique em "Não tem conta? Cadastre-se"
3. Preencha: Nome, Email, Senha
4. Clique em "Cadastrar"
5. **Esperado:** Mensagem de sucesso

### ✅ Teste 2: Login
1. Após cadastrar, faça login
2. Preencha Email e Senha
3. Clique em "Entrar"
4. **Esperado:** Redirecionamento para `/dashboard`

### ✅ Teste 3: Dashboard
1. Após login, você deve ver o dashboard
2. **Esperado:** Página carrega sem erros

### ✅ Teste 4: Navegação
1. Clique nos links do menu lateral
2. Teste: Courts, Bookings, Products, etc.
3. **Esperado:** Páginas carregam (mesmo que vazias)

---

## 🔍 Verificar se Está Funcionando

### No Console do Navegador (F12):

1. **Abra o DevTools** (F12)
2. Vá na aba **"Console"**
3. Procure por:
   - ✅ Requisições bem-sucedidas (200)
   - ❌ Erros de conexão (CORS, 404, etc.)

### Na Aba Network (F12):

1. Vá na aba **"Network"**
2. Faça login ou navegue
3. Veja as requisições:
   - `/auth/login` → Status 200 ✅
   - `/auth/register` → Status 201 ✅
   - `/courts` → Status 200 ✅

---

## ⚠️ Problemas Comuns

### Erro: "Network Error" ou "CORS"

**Causa:** Backend não está rodando ou URL incorreta

**Solução:**
- ✅ Verifique se o backend está rodando
- ✅ Verifique se `NEXT_PUBLIC_API_URL` está correto
- ✅ Se backend está no Railway, verifique se está "Online"

### Erro: "401 Unauthorized"

**Causa:** Token inválido ou expirado

**Solução:**
- ✅ Faça login novamente
- ✅ Limpe o localStorage: `localStorage.clear()`

### Erro: "Cannot connect to API"

**Causa:** URL da API incorreta

**Solução:**
- ✅ Verifique `.env.local`
- ✅ Reinicie o frontend após mudar `.env.local`
- ✅ Verifique se a URL do Railway está correta

---

## 🎯 Teste Rápido

### Passo a Passo Simplificado:

1. **Crie `.env.local` em `frontend/`:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
   (ou a URL do Railway)

2. **Inicie o frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Abra no navegador:**
   ```
   http://localhost:3000/login
   ```

4. **Cadastre e faça login**

5. **Pronto!** Se funcionar, a API está conectada ✅

---

## 📝 Resumo

**Para testar pelo frontend:**

1. ✅ Configure `NEXT_PUBLIC_API_URL` no `.env.local`
2. ✅ Inicie o frontend: `npm run dev`
3. ✅ Acesse `http://localhost:3000/login`
4. ✅ Cadastre e faça login
5. ✅ Teste o dashboard

**Se o login funcionar, a API está conectada e funcionando!** 🎉

