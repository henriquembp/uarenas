# Arenas - Sistema de Gestão

Sistema de gestão para arenas de esportes de areia (vôlei, futevôlei e beach tennis).

## 🏗️ Arquitetura

- **Backend**: NestJS + PostgreSQL + Prisma
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Hospedagem**: Railway (backend + banco) + Vercel (frontend)

## 📁 Estrutura do Projeto

```
.
├── backend/          # API NestJS
│   ├── src/
│   │   ├── auth/     # Autenticação JWT
│   │   ├── users/    # Gestão de usuários
│   │   ├── courts/   # Gestão de quadras
│   │   ├── bookings/ # Reservas
│   │   ├── classes/  # Turmas
│   │   ├── invoices/ # Mensalidades
│   │   ├── stores/   # Lojas
│   │   ├── products/ # Produtos
│   │   ├── stock/    # Estoque
│   │   └── sales/    # Vendas
│   └── prisma/       # Schema do banco
└── frontend/         # Next.js App
    └── app/          # Páginas e rotas
```

## 🚀 Como começar

### Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env`:
```bash
cp .env.example .env
```

4. Configure a `DATABASE_URL` no `.env` com suas credenciais do PostgreSQL

5. Execute as migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

6. Inicie o servidor:
```bash
npm run start:dev
```

O backend estará rodando em `http://localhost:3001`

### Frontend

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## 📋 Funcionalidades

### Gestão de Quadras
- Cadastro de quadras (vôlei, futevôlei, beach tennis)
- Visualização de quadras disponíveis

### Reservas
- Usuários podem reservar horários nas quadras
- Visitantes podem visualizar disponibilidade
- Usuários cadastrados podem fazer reservas

### Turmas e Professores
- Administradores criam turmas
- Alocação de professores e alunos
- Reservas recorrentes de quadras

### Financeiro
- Gestão de mensalidades dos alunos
- Baixa manual de pagamentos
- Controle de faturas pendentes/pagas

### Loja e Produtos
- Cadastro de lojas e produtos
- Controle de estoque
- Gestão de vendas

## 🔐 Autenticação

O sistema possui 4 tipos de usuários:
- **ADMIN**: Acesso total ao sistema
- **TEACHER**: Professores que lecionam turmas
- **STUDENT**: Alunos que participam de turmas
- **VISITOR**: Usuários que podem apenas visualizar e fazer reservas

## 🗄️ Banco de Dados

O banco de dados PostgreSQL é gerenciado pelo Prisma. Os principais modelos são:

- User (usuários)
- Court (quadras)
- Booking (reservas)
- Class (turmas)
- Invoice (faturas)
- Store (lojas)
- Product (produtos)
- StockMovement (movimentações de estoque)
- Sale (vendas)

## 📝 Próximos Passos

1. Configurar Railway para backend e banco
2. Configurar Vercel para frontend
3. Implementar upload de imagens (Supabase Storage)
4. Adicionar validações e tratamento de erros
5. Implementar testes
6. Adicionar dashboard com gráficos e estatísticas

## 📄 Licença

MIT



