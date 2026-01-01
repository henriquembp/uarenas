# 🚀 Executar Migrations no Railway AGORA

## Situação
- ✅ Banco do Railway tem apenas `_prisma_migrations` (tabela de controle do Prisma)
- ✅ Banco local tem todas as tabelas
- ❌ Migrations não foram executadas no Railway

---

## ✅ Solução: Executar Migrations Manualmente

### Passo a Passo:

1. **Instalar Railway CLI** (se ainda não tem):
   ```powershell
   npm i -g @railway/cli
   ```

2. **Fazer login:**
   ```powershell
   railway login
   ```
   - Isso vai abrir o navegador para autenticar

3. **Navegar para o backend:**
   ```powershell
   cd "C:\Trabalho\Repositorio Pessoal\Arenas\backend"
   ```

4. **Conectar ao projeto Railway:**
   ```powershell
   railway link
   ```
   - Vai perguntar qual projeto: selecione **`uarena`**
   - Vai perguntar qual serviço: selecione **`uarena-code`**

5. **Executar as migrations:**
   ```powershell
   railway run npm run prisma:migrate:deploy
   ```

   Isso vai:
   - Conectar ao banco do Railway
   - Executar todas as migrations pendentes
   - Criar todas as tabelas

6. **Verificar o resultado:**
   - Você verá mensagens como:
     ```
     Applying migration `20251231155914_uarena_mig`
     The following migration(s) have been applied:
     ...
     ```

---

## ✅ Depois de Executar

Depois que as migrations rodarem, teste:

1. **No Railway Dashboard → uarena-db → Database → Data:**
   - Você deve ver todas as tabelas: `users`, `courts`, `bookings`, etc.

2. **Teste no Postman:**
   ```
   POST https://sua-url-railway.app/auth/register
   Body: {
     "email": "teste@example.com",
     "password": "senha123",
     "name": "Teste"
   }
   ```
   - Deve retornar 201 Created ✅

---

## 🐛 Se Der Erro

Se aparecer algum erro, me diga qual foi a mensagem exata e eu te ajudo a resolver!

Possíveis erros:
- ❌ "No migrations found" → migrations não estão no Git
- ❌ "DATABASE_URL not found" → variável não configurada
- ❌ "Connection refused" → problema de conexão com o banco

---

Execute os comandos acima e me diga o que aconteceu! 🚀

