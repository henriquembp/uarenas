# Arenas Frontend

Frontend do sistema de gestão de arenas de esportes de areia.

## Tecnologias

- Next.js 14
- TypeScript
- Tailwind CSS
- Axios

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Executar

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## Estrutura

- `app/` - Páginas e rotas (App Router do Next.js)
- `lib/` - Utilitários e helpers
- `components/` - Componentes reutilizáveis (a criar)

## Páginas

- `/login` - Login e cadastro
- `/dashboard` - Dashboard principal
- `/dashboard/courts` - Gestão de quadras
- `/dashboard/bookings` - Reservas
- `/dashboard/classes` - Turmas
- `/dashboard/teachers` - Professores
- `/dashboard/invoices` - Financeiro
- `/dashboard/products` - Produtos
- `/dashboard/stock` - Estoque
- `/dashboard/sales` - Vendas



