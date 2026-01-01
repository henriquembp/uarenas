# 🧪 Guia de Testes no Railway

Este guia mostra como testar sua API deployada no Railway.

## 📍 Passo 1: Descobrir a URL do Backend

1. Acesse o [Railway Dashboard](https://railway.app)
2. Entre no seu projeto
3. Clique no serviço do **backend**
4. Vá na aba **"Settings"** ou **"Deployments"**
5. Procure por **"Public Domain"** ou **"Generated Domain"**
   - A URL será algo como: `https://seu-projeto-production.up.railway.app`
   - Exemplo: `https://arenas-backend-production.up.railway.app`

**Alternativa:** A URL também aparece na aba **"Variables"** ou **"Deployments"** na lista de variáveis de ambiente.

---

## 🔧 Passo 2: Configurar o Postman

### Opção A: Atualizar a Collection (Recomendado)

1. Abra o Postman
2. Importe a collection `Arenas_API.postman_collection.json` (se ainda não importou)
3. Clique nos **três pontos** (...) ao lado do nome da collection
4. Selecione **"Edit"**
5. Vá na aba **"Variables"**
6. Altere o valor de `base_url` para a URL do Railway:
   ```
   https://seu-projeto-production.up.railway.app
   ```
7. Clique em **"Save"**

### Opção B: Usar Environment (Alternativa)

1. No Postman, clique em **"Environments"** (canto superior direito)
2. Clique em **"+"** para criar um novo environment
3. Nome: `Railway Production`
4. Adicione a variável:
   - Variable: `base_url`
   - Initial Value: `https://seu-projeto-production.up.railway.app`
   - Current Value: `https://seu-projeto-production.up.railway.app`
5. Salve e selecione este environment no dropdown

---

## ✅ Passo 3: Testes Básicos

### 3.1. Testar Health Check (Endpoint Público)

Este é o teste mais simples para verificar se a API está funcionando.

**No Postman:**
1. Abra a collection → **Health** → **Health Check**
2. Clique em **"Send"**
3. **Resposta esperada:**
   ```json
   {
     "status": "ok",
     "timestamp": "2025-01-15T10:00:00.000Z",
     "service": "arenas-backend"
   }
   ```

**No Navegador:**
- Acesse: `https://seu-projeto-production.up.railway.app/health`
- Você deve ver a resposta JSON acima

**✅ Se funcionou:** A API está rodando corretamente!
**❌ Se não funcionou:** Verifique os logs no Railway (veja Passo 5)

---

### 3.2. Testar Registro de Usuário

**No Postman:**
1. Abra: **Auth** → **Register**
2. No body, ajuste os dados:
   ```json
   {
     "email": "teste@example.com",
     "password": "senha123",
     "name": "Usuário Teste",
     "phone": "11999999999"
   }
   ```
3. Clique em **"Send"**
4. **Resposta esperada (201 Created):**
   ```json
   {
     "id": "uuid-gerado",
     "email": "teste@example.com",
     "name": "Usuário Teste",
     "role": "VISITOR",
     "createdAt": "2025-01-15T10:00:00.000Z"
   }
   ```

---

### 3.3. Testar Login

**No Postman:**
1. Abra: **Auth** → **Login**
2. Use o mesmo email e senha do registro:
   ```json
   {
     "email": "teste@example.com",
     "password": "senha123"
   }
   ```
3. Clique em **"Send"**
4. **Resposta esperada (200 OK):**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "uuid",
       "email": "teste@example.com",
       "name": "Usuário Teste",
       "role": "VISITOR"
     }
   }
   ```

**✅ Importante:** O Postman salvará automaticamente o `access_token` na variável `access_token` devido ao script configurado. Você verá ele nas variáveis da collection.

---

### 3.4. Testar Endpoints Protegidos

Agora que você tem o token, pode testar endpoints que precisam de autenticação.

**Exemplo: Listar Quadras (Público, mas vamos testar autenticado):**
1. Abra: **Courts** → **List Courts**
2. O token já deve estar configurado automaticamente
3. Clique em **"Send"**
4. **Resposta esperada:** Lista de quadras (pode estar vazia inicialmente)

**Exemplo: Criar Quadra (ADMIN apenas):**
1. Para criar uma quadra, você precisa ser ADMIN
2. Primeiro, crie um usuário ADMIN manualmente no banco ou via código
3. Ou teste outros endpoints que não requerem ADMIN:
   - **Bookings** → **List Bookings** (autenticado)
   - **Stores** → **List Stores** (autenticado)
   - **Products** → **List Products** (autenticado)

---

## 📊 Passo 4: Verificar Logs no Railway

Se algo não funcionar, verifique os logs:

1. No Railway Dashboard, clique no serviço do **backend**
2. Vá na aba **"Deployments"**
3. Clique no deployment mais recente
4. Ou vá na aba **"Logs"** para ver logs em tempo real

**O que procurar nos logs:**
- ✅ `🚀 Backend rodando na porta XXXX`
- ✅ `✅ Prisma conectado ao banco de dados`
- ❌ Erros de conexão com o banco
- ❌ Erros de migração do Prisma
- ❌ Erros de compilação

---

## 🐛 Problemas Comuns

### ❌ Erro: "Cannot GET /health"

**Possíveis causas:**
- A aplicação não está rodando
- A URL está incorreta
- O endpoint não existe

**Soluções:**
1. Verifique os logs no Railway
2. Confirme que o deployment foi bem-sucedido
3. Verifique se a porta está configurada corretamente

---

### ❌ Erro: "Connection refused" ou timeout

**Possíveis causas:**
- O serviço está crashando após iniciar
- Problema de conexão com o banco de dados

**Soluções:**
1. Verifique os logs no Railway
2. Confirme que a `DATABASE_URL` está configurada corretamente
3. Verifique se o serviço PostgreSQL está rodando no Railway

---

### ❌ Erro: "Unauthorized" ou 401

**Possíveis causas:**
- Token JWT inválido ou expirado
- Token não está sendo enviado

**Soluções:**
1. Faça login novamente para obter um novo token
2. Verifique se a variável `access_token` está sendo usada corretamente
3. Confirme que o header `Authorization: Bearer <token>` está sendo enviado

---

### ❌ Erro: "Forbidden" ou 403

**Possíveis causas:**
- Usuário não tem permissão (precisa ser ADMIN)
- Role incorreta no banco de dados

**Soluções:**
1. Verifique o role do usuário no banco
2. Use um usuário com role `ADMIN` para endpoints administrativos

---

## 🎯 Checklist de Testes

Use esta checklist para garantir que tudo está funcionando:

- [ ] Health check retorna 200 OK
- [ ] Registro de usuário funciona (201 Created)
- [ ] Login funciona e retorna token (200 OK)
- [ ] Token é salvo automaticamente no Postman
- [ ] Listar quadras funciona (GET /courts)
- [ ] Criar quadra funciona com usuário ADMIN (POST /courts)
- [ ] Listar reservas funciona com autenticação (GET /bookings)
- [ ] Criar reserva funciona (POST /bookings)
- [ ] Outros endpoints retornam respostas esperadas

---

## 📝 Exemplo de Teste Completo

### Cenário: Criar uma Reserva

1. **Health Check:** ✅ Verificar se API está rodando
2. **Register:** ✅ Criar um novo usuário
3. **Login:** ✅ Obter token de acesso
4. **List Courts:** ✅ Ver quais quadras existem (se não houver, criar uma como ADMIN)
5. **Create Booking:** ✅ Criar uma reserva usando o `courtId` obtido
6. **Get Booking:** ✅ Buscar a reserva criada usando o `id` retornado

---

## 🔗 URLs Úteis

- **Railway Dashboard:** https://railway.app
- **Postman:** https://www.postman.com
- **Documentação Railway:** https://docs.railway.app

---

## 💡 Dicas

1. **Mantenha a collection do Postman atualizada** com a URL correta do Railway
2. **Use environments no Postman** para alternar entre local e produção facilmente
3. **Monitore os logs** durante os testes para identificar problemas rapidamente
4. **Teste endpoints públicos primeiro** antes de testar autenticados
5. **Crie um usuário ADMIN** para testar todos os endpoints administrativos

---

Boa sorte com os testes! 🚀

