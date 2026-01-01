# 🚀 Solução Rápida: Executar Migrations no Railway

## Problema
As tabelas não existem no banco do Railway porque as migrations não foram executadas.

---

## ✅ Solução Mais Simples (Via Railway Dashboard)

### Opção 1: Configurar Start Command (Recomendado)

1. **No Railway Dashboard:**
   - Acesse o serviço `uarena-code`
   - Vá na aba **"Settings"**
   - Role até encontrar **"Deploy"** ou **"Start Command"**

2. **Configure o Start Command:**
   - Procure por **"Start Command"** ou **"Start Script"**
   - Altere para: `npm run railway:start`
   - OU: `npm run prisma:migrate:deploy && npm run start:prod`

3. **Salve e force um redeploy:**
   - Vá em **"Deployments"**
   - Clique nos **três pontos (...)** do deployment mais recente
   - Selecione **"Redeploy"**

   Isso vai executar as migrations automaticamente!

---

## ✅ Solução Alternativa (Via Railway CLI)

1. **Instale o Railway CLI:**
   ```powershell
   npm i -g @railway/cli
   ```

2. **Faça login:**
   ```powershell
   railway login
   ```

3. **Navegue até o backend:**
   ```powershell
   cd "C:\Trabalho\Repositorio Pessoal\Arenas\backend"
   ```

4. **Conecte ao projeto:**
   ```powershell
   railway link
   ```
   - Selecione: `uarena`
   - Selecione: `uarena-code`

5. **Execute as migrations:**
   ```powershell
   railway run npm run prisma:migrate:deploy
   ```

---

## 🔍 Verificar se Funcionou

Depois de executar, teste:

1. **Registrar usuário:**
   ```
   POST https://sua-url-railway.app/auth/register
   Body: {
     "email": "teste@example.com",
     "password": "senha123",
     "name": "Teste"
   }
   ```

2. Se retornar 201 Created → ✅ Funcionou!
3. Se retornar erro de tabela não existe → ❌ Ainda precisa executar as migrations

---

## 💡 Dica

A **Opção 1** é mais fácil porque você só faz uma vez e depois as migrations executam automaticamente em cada deploy!

