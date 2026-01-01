# Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend com as seguintes variáveis:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/arenas_db?schema=public"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL="http://localhost:3000"
```

## Descrição

- `DATABASE_URL`: String de conexão do PostgreSQL
- `JWT_SECRET`: Chave secreta para assinatura dos tokens JWT
- `JWT_EXPIRES_IN`: Tempo de expiração do token (padrão: 7d)
- `PORT`: Porta onde o servidor irá rodar (padrão: 3001)
- `NODE_ENV`: Ambiente de execução (development/production)
- `FRONTEND_URL`: URL do frontend para configuração de CORS



