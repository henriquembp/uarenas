# 🔍 Troubleshooting - Login não Funciona

## ✅ Health Check Funcionou
Ótimo! Isso significa que:
- A URL do backend está correta ✅
- O servidor está rodando ✅
- A conexão está funcionando ✅

---

## ❌ Problema: Login Não Funciona

Vamos diagnosticar passo a passo:

### 1️⃣ Verificar o Endpoint Correto

O endpoint de login é:
```
POST https://sua-url-railway.app/auth/login
```

**NÃO é:**
- ❌ `/login` (sem o `/auth`)
- ❌ `GET /auth/login` (deve ser POST)

---

### 2️⃣ Verificar o Body da Requisição

No Postman, certifique-se de que:

**Método:** `POST`

**URL:** `{{base_url}}/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "seu-email@example.com",
  "password": "suasenha123"
}
```

---

### 3️⃣ Verificar o Erro Específico

Qual erro você está recebendo?

#### A) Erro 404 - Not Found
**Sintoma:** 
```json
{
  "statusCode": 404,
  "message": "Cannot POST /auth/login"
}
```

**Causa:** Endpoint não existe ou URL incorreta

**Solução:**
- Verifique se a URL está correta: `https://sua-url/auth/login`
- Confirme que o backend foi deployado com o código mais recente

---

#### B) Erro 400 - Bad Request
**Sintoma:**
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password should not be empty"]
}
```

**Causa:** Body da requisição está incorreto ou faltando campos

**Solução:**
- Verifique se está enviando `email` e `password`
- Verifique se o Content-Type é `application/json`
- Verifique se o JSON está bem formatado

---

#### C) Erro 401 - Unauthorized
**Sintoma:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**Causa:** Email ou senha incorretos, ou usuário não existe

**Solução:**
1. **Primeiro, registre um usuário:**
   - Endpoint: `POST /auth/register`
   - Body:
   ```json
   {
     "email": "teste@example.com",
     "password": "senha123",
     "name": "Usuário Teste",
     "phone": "11999999999"
   }
   ```

2. **Depois, faça login com o mesmo email e senha**

---

#### D) Erro 500 - Internal Server Error
**Sintoma:**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

**Causa:** Erro no servidor (possivelmente banco de dados)

**Solução:**
1. Verifique os logs no Railway
2. Verifique se o banco de dados está conectado
3. Verifique se as migrations foram executadas

---

#### E) Erro de CORS
**Sintoma:** No navegador, erro como:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Causa:** Problema de CORS (mas não deveria acontecer se estiver testando pelo Postman)

**Solução:**
- Se estiver testando pelo Postman, CORS não é problema
- Se estiver testando pelo navegador, verifique a configuração de FRONTEND_URL no Railway

---

### 4️⃣ Teste Passo a Passo no Postman

#### Teste 1: Verificar se o endpoint existe
1. Abra: **Auth** → **Login**
2. Verifique se a URL está: `{{base_url}}/auth/login`
3. Clique em **Send**
4. **Mesmo com body vazio**, você deve receber um erro 400 (não 404)

**Se receber 404:** O endpoint não existe. Verifique o deploy.

---

#### Teste 2: Registrar um usuário primeiro
1. Abra: **Auth** → **Register**
2. Body:
```json
{
  "email": "teste@example.com",
  "password": "senha123",
  "name": "Usuário Teste",
  "phone": "11999999999"
}
```
3. Clique em **Send**
4. Deve retornar 201 Created com os dados do usuário

---

#### Teste 3: Fazer login
1. Abra: **Auth** → **Login**
2. Body:
```json
{
  "email": "teste@example.com",
  "password": "senha123"
}
```
3. Clique em **Send**
4. Deve retornar 200 OK com o token

---

### 5️⃣ Verificar Logs no Railway

Se nada funcionar, verifique os logs:

1. No Railway Dashboard
2. Clique no serviço `uarena-code`
3. Aba **"Logs"**
4. Procure por erros relacionados a:
   - `auth/login`
   - `Prisma`
   - `Database`

---

### 6️⃣ Checklist Rápido

- [ ] URL correta: `https://sua-url/auth/login` (com `/auth`)
- [ ] Método: POST (não GET)
- [ ] Header: `Content-Type: application/json`
- [ ] Body válido com `email` e `password`
- [ ] Usuário existe (fez register antes?)
- [ ] Backend está online (health check funciona)
- [ ] Verificou os logs no Railway?

---

## 🎯 Teste Rápido no Postman

1. **Health Check:**
   - `GET {{base_url}}/health` → Deve retornar 200 ✅

2. **Register:**
   - `POST {{base_url}}/auth/register`
   - Body: `{"email":"teste@test.com","password":"123456","name":"Teste"}`
   - Deve retornar 201 ✅

3. **Login:**
   - `POST {{base_url}}/auth/login`
   - Body: `{"email":"teste@test.com","password":"123456"}`
   - Deve retornar 200 com token ✅

---

**Qual erro específico você está recebendo?** Me diga e eu te ajudo a resolver! 😊

