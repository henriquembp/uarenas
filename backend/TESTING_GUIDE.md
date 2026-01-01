# 🧪 Guia de Testes da API

## 🎯 Como Testar se a Aplicação Está Funcionando

---

## 1️⃣ Teste Básico: Health Check (Sem Autenticação)

O endpoint `/health` é público e não precisa de autenticação.

### No Railway:

1. **Descubra a URL do seu backend:**
   - No Railway, vá no serviço `uarena-code`
   - Aba **"Settings"** ou **"Deployments"**
   - Procure por **"Public Domain"** ou **"Generate Domain"**
   - A URL será algo como: `https://uarena-code-production.up.railway.app`

2. **Teste no navegador:**
   ```
   https://SUA-URL-RAILWAY/health
   ```
   
   **Resposta esperada:**
   ```json
   {
     "status": "ok",
     "timestamp": "2025-12-31T17:00:00.000Z",
     "service": "arenas-backend"
   }
   ```

### Localmente:

```bash
# Se estiver rodando localmente
curl http://localhost:3001/health
```

**Ou abra no navegador:**
```
http://localhost:3001/health
```

---

## 2️⃣ Teste de Autenticação (Registro e Login)

### 2.1 Registrar um Usuário

**Endpoint:** `POST /auth/register`

**Usando curl:**
```bash
curl -X POST https://SUA-URL-RAILWAY/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123",
    "name": "Usuário Teste",
    "phone": "11999999999"
  }'
```

**Resposta esperada:**
```json
{
  "id": "uuid-here",
  "email": "teste@example.com",
  "name": "Usuário Teste",
  "phone": "11999999999",
  "role": "VISITOR"
}
```

### 2.2 Fazer Login

**Endpoint:** `POST /auth/login`

```bash
curl -X POST https://SUA-URL-RAILWAY/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

**Resposta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "teste@example.com",
    "name": "Usuário Teste",
    "role": "VISITOR"
  }
}
```

**⚠️ IMPORTANTE:** Guarde o `access_token` para usar nos próximos testes!

---

## 3️⃣ Teste de Endpoints Protegidos

### 3.1 Listar Quadras (Courts) - Público

**Endpoint:** `GET /courts`

```bash
curl https://SUA-URL-RAILWAY/courts
```

**Resposta esperada:**
```json
[]
```
(Array vazio se não houver quadras cadastradas)

### 3.2 Listar Usuários (Precisa de Token)

**Endpoint:** `GET /users`

```bash
curl https://SUA-URL-RAILWAY/users \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

**Resposta esperada:**
```json
[
  {
    "id": "uuid",
    "email": "teste@example.com",
    "name": "Usuário Teste",
    "role": "VISITOR"
  }
]
```

---

## 4️⃣ Usando Postman (Recomendado)

### Configuração Inicial:

1. **Crie uma Collection** chamada "Arenas API"
2. **Configure a URL base:**
   - Variable: `base_url`
   - Value: `https://SUA-URL-RAILWAY` (ou `http://localhost:3001` local)

### Testes no Postman:

#### 4.1 Health Check
- **Method:** GET
- **URL:** `{{base_url}}/health`
- **Auth:** None

#### 4.2 Register
- **Method:** POST
- **URL:** `{{base_url}}/auth/register`
- **Body (JSON):**
  ```json
  {
    "email": "teste@example.com",
    "password": "senha123",
    "name": "Usuário Teste"
  }
  ```

#### 4.3 Login
- **Method:** POST
- **URL:** `{{base_url}}/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "teste@example.com",
    "password": "senha123"
  }
  ```
- **Tests (Script):**
  ```javascript
  if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.access_token);
  }
  ```

#### 4.4 Listar Usuários (com Token)
- **Method:** GET
- **URL:** `{{base_url}}/users`
- **Auth:** Bearer Token
- **Token:** `{{access_token}}`

---

## 5️⃣ Endpoints Disponíveis

### Públicos (Sem Autenticação):
- `GET /health` - Health check
- `GET /courts` - Listar quadras
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login

### Protegidos (Precisam de Token):
- `GET /users` - Listar usuários (ADMIN)
- `GET /bookings` - Listar reservas
- `POST /bookings` - Criar reserva
- `GET /classes` - Listar turmas
- `GET /products` - Listar produtos
- `GET /stores` - Listar lojas
- E outros...

---

## 6️⃣ Teste Local vs Railway

### Localmente:
```bash
# Iniciar servidor
cd backend
npm run start:dev

# Testar
curl http://localhost:3001/health
```

### No Railway:
```bash
# Descubra a URL no Railway
# Teste
curl https://SUA-URL-RAILWAY/health
```

---

## 7️⃣ Verificar Logs

### No Railway:
1. Vá na aba **"Logs"**
2. Procure por:
   - ✅ `🚀 Backend rodando na porta 3001`
   - ✅ `✅ Prisma conectado ao banco de dados`
   - ✅ `LOG [NestApplication] Nest application successfully started`

### Localmente:
Os logs aparecem no terminal onde você rodou `npm run start:dev`

---

## 8️⃣ Checklist de Testes

- [ ] Health check retorna `{"status": "ok"}`
- [ ] Registro de usuário funciona
- [ ] Login retorna `access_token`
- [ ] Endpoints protegidos funcionam com token
- [ ] Logs mostram que servidor está rodando
- [ ] Prisma conectou ao banco

---

## 9️⃣ Exemplos Práticos

### Teste Completo (Sequência):

```bash
# 1. Health check
curl https://SUA-URL-RAILWAY/health

# 2. Registrar
curl -X POST https://SUA-URL-RAILWAY/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@test.com","password":"123456","name":"Teste"}'

# 3. Login (guarde o token)
TOKEN=$(curl -X POST https://SUA-URL-RAILWAY/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@test.com","password":"123456"}' \
  | jq -r '.access_token')

# 4. Usar token
curl https://SUA-URL-RAILWAY/courts \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔟 Troubleshooting

### Erro: "Cannot GET /"
- ✅ Verifique se está usando a URL correta
- ✅ Verifique se o servidor está rodando

### Erro: "Unauthorized"
- ✅ Verifique se está enviando o token
- ✅ Verifique se o token está válido (não expirou)

### Erro: "CORS"
- ✅ Verifique se `FRONTEND_URL` está configurada no Railway
- ✅ Ou teste com Postman/curl (não tem problema de CORS)

---

## 📝 Resumo Rápido

**Teste mais simples:**
```
Abra no navegador: https://SUA-URL-RAILWAY/health
```

**Deve retornar:**
```json
{"status":"ok","timestamp":"...","service":"arenas-backend"}
```

Se isso funcionar, a aplicação está rodando! 🎉

