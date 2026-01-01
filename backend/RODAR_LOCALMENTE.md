# 🚀 Como Rodar o Backend Localmente

## 📋 Pré-requisitos

1. **Node.js** instalado (versão 18 ou superior)
2. **PostgreSQL** rodando localmente ou acesso a um banco remoto
3. **Arquivo `.env`** configurado na pasta `backend/`

---

## 🔧 Passo a Passo

### 1. Instalar Dependências

```powershell
cd "C:\Trabalho\Repositorio Pessoal\Arenas\backend"
npm install
```

---

### 2. Configurar Variáveis de Ambiente

Certifique-se de que o arquivo `backend/.env` existe e contém:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/arenas?schema=public"
JWT_SECRET="sua-chave-secreta-aqui"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

**Importante:**
- Substitua `usuario`, `senha` e `arenas` pelos seus dados do PostgreSQL
- A `JWT_SECRET` pode ser qualquer string aleatória (ex: `minha-chave-super-secreta-123`)
- A `PORT` padrão é `3001`

---

### 3. Gerar o Prisma Client

```powershell
npm run prisma:generate
```

---

### 4. Aplicar Migrations (se necessário)

Se o banco ainda não tiver as tabelas criadas:

```powershell
npm run prisma:migrate
```

Quando perguntar o nome da migration, você pode usar qualquer nome ou deixar o padrão.

---

### 5. Rodar o Backend

**Modo Desenvolvimento (com hot-reload):**
```powershell
npm run start:dev
```

**Modo Produção:**
```powershell
npm run build
npm run start:prod
```

---

## ✅ Verificar se Está Funcionando

Após iniciar, você deve ver uma mensagem como:

```
🚀 Backend rodando na porta 3001
```

Teste o endpoint de health check:

```
GET http://localhost:3001/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🛠️ Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Inicia em modo desenvolvimento (recomendado) |
| `npm run start:prod` | Inicia em modo produção |
| `npm run prisma:studio` | Abre o Prisma Studio (interface visual do banco) |
| `npm run prisma:migrate` | Cria e aplica uma nova migration |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run build` | Compila o TypeScript para JavaScript |

---

## ❌ Problemas Comuns

### Erro: "Cannot find module"
```powershell
# Reinstale as dependências
npm install
```

### Erro: "Can't reach database server"
- Verifique se o PostgreSQL está rodando
- Confirme a `DATABASE_URL` no `.env`
- Teste a conexão manualmente

### Erro: "Port 3001 already in use"
- Altere a `PORT` no `.env` para outra porta (ex: `3002`)
- Ou feche o processo que está usando a porta 3001

---

## 📝 Exemplo Completo

```powershell
# 1. Navegar para a pasta do backend
cd "C:\Trabalho\Repositorio Pessoal\Arenas\backend"

# 2. Instalar dependências (só na primeira vez)
npm install

# 3. Gerar Prisma Client
npm run prisma:generate

# 4. Aplicar migrations (se necessário)
npm run prisma:migrate

# 5. Iniciar o servidor
npm run start:dev
```

---

**Pronto! O backend estará rodando em `http://localhost:3001`** 🎉

