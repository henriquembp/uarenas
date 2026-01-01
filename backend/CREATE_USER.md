# 👤 Como Criar Usuários

## Opção 1: Cadastro pelo Frontend (Recomendado)

1. Acesse `http://localhost:3000/login`
2. Clique em "Não tem conta? Cadastre-se"
3. Preencha os dados
4. Clique em "Cadastrar"
5. Faça login

**Nota:** Usuários criados assim terão role `VISITOR` por padrão.

---

## Opção 2: Criar via API (curl)

### Criar Usuário Normal:

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"usuario@test.com\",\"password\":\"senha123\",\"name\":\"Usuário Teste\"}"
```

### Resposta:
```json
{
  "id": "uuid-aqui",
  "email": "usuario@test.com",
  "name": "Usuário Teste",
  "role": "VISITOR"
}
```

---

## Opção 3: Criar Usuário ADMIN via Prisma Studio

Para criar um usuário com role ADMIN:

1. **Abra o Prisma Studio:**
   ```bash
   cd backend
   npm run prisma:studio
   ```

2. **Acesse no navegador:**
   ```
   http://localhost:5555
   ```

3. **Crie um usuário:**
   - Clique em "User"
   - Clique em "Add record"
   - Preencha:
     - `email`: admin@test.com
     - `password`: (você precisa hash, veja abaixo)
     - `name`: Admin
     - `role`: ADMIN
   - **⚠️ IMPORTANTE:** A senha precisa estar em hash (bcrypt)

### Gerar Hash da Senha:

Você pode usar Node.js para gerar o hash:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('senha123', 10).then(hash => console.log(hash))"
```

Ou criar um script temporário:

```javascript
// create-admin.js (temporário)
const bcrypt = require('bcrypt');

bcrypt.hash('senha123', 10).then(hash => {
  console.log('Hash da senha:', hash);
});
```

---

## Opção 4: Criar Script de Seed (Recomendado para Admin)

Criar um script que cria um usuário admin automaticamente:

### 1. Criar arquivo `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuário admin criado:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 2. Executar:

```bash
cd backend
npm run prisma:seed
```

---

## 🔑 Roles Disponíveis

- `VISITOR` - Usuário comum (padrão no registro)
- `STUDENT` - Estudante
- `TEACHER` - Professor
- `ADMIN` - Administrador (tem acesso a tudo)

---

## ✅ Recomendação

**Para testar rápido:**
- Use o **cadastro pelo frontend** (Opção 1)

**Para criar um ADMIN:**
- Use o **script de seed** (Opção 4)

