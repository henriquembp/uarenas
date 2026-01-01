# Arenas Backend

Backend API para sistema de gestão de arenas de esportes de areia.

## Tecnologias

- NestJS
- PostgreSQL
- Prisma ORM
- JWT Authentication

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`
2. Configure a `DATABASE_URL` com suas credenciais do PostgreSQL
3. Configure o `JWT_SECRET` com uma chave secreta forte

## Banco de Dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar migrations
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio
```

## Executar

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## Estrutura de Módulos

- `auth` - Autenticação e autorização
- `users` - Gestão de usuários
- `courts` - Gestão de quadras
- `bookings` - Reservas de quadras
- `classes` - Turmas e aulas
- `invoices` - Mensalidades e faturas
- `stores` - Lojas
- `products` - Produtos
- `stock` - Controle de estoque
- `sales` - Vendas



