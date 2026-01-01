# 🔧 Corrigir Erro "Forbidden resource" (403)

## ❌ Problema

O erro **"Forbidden resource" (403)** ocorre porque:

1. **Usuários criados via registro recebem role `VISITOR`** (linha 41 de `auth.service.ts`)
2. **Endpoints de quadras requerem role `ADMIN`**:
   - `POST /courts` - Criar quadra
   - `PATCH /courts/:id` - Editar quadra
   - `POST /upload/image` - Upload de imagem

---

## ✅ Solução: Atualizar Role do Usuário para ADMIN

### Opção 1: Via Banco de Dados (Mais Rápido)

1. **Acesse o banco de dados do Railway:**
   - Acesse: https://railway.app
   - Selecione o serviço do banco (`uarena-db`)
   - Vá em **"Data"** ou **"Query"**
   - Ou use um cliente SQL (pgAdmin, DBeaver, etc)

2. **Execute o SQL:**
   ```sql
   UPDATE users 
   SET role = 'ADMIN' 
   WHERE email = 'seu_email@exemplo.com';
   ```

3. **Ou atualize todos os usuários (se for desenvolvimento):**
   ```sql
   UPDATE users 
   SET role = 'ADMIN';
   ```

4. **Faça logout e login novamente** no frontend para atualizar o token JWT

---

### Opção 2: Via API (Se tiver endpoint de usuários)

Se houver um endpoint para atualizar usuários, você pode usar:

```bash
curl -X PATCH https://uarena.up.railway.app/users/SEU_USER_ID \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

---

### Opção 3: Criar Script para Tornar Primeiro Usuário ADMIN

Crie um script que automaticamente torna o primeiro usuário ADMIN:

**Arquivo: `backend/prisma/seed-admin.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Pega o primeiro usuário ou um usuário específico
  const user = await prisma.user.findFirst({
    where: { email: 'seu_email@exemplo.com' },
  });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
    });
    console.log(`✅ Usuário ${user.email} atualizado para ADMIN`);
  } else {
    console.log('❌ Usuário não encontrado');
  }
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

Execute:
```bash
cd backend
npx ts-node prisma/seed-admin.ts
```

---

### Opção 4: Atualizar Código para Tornar Primeiro Usuário ADMIN Automaticamente

Modifique `auth.service.ts` para tornar o primeiro usuário ADMIN:

```typescript
async register(email: string, password: string, name: string, phone?: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Verifica se é o primeiro usuário
  const userCount = await this.usersService.count();
  const role = userCount === 0 ? 'ADMIN' : 'VISITOR';
  
  const user = await this.usersService.create({
    email,
    password: hashedPassword,
    name,
    phone,
    role,
  });
  const { password: _, ...result } = user;
  return result;
}
```

---

## 🔍 Verificar Role Atual do Usuário

Para verificar qual role seu usuário tem:

1. **Via Banco de Dados:**
   ```sql
   SELECT id, email, name, role FROM users;
   ```

2. **Via Token JWT:**
   - Abra o console do navegador (F12)
   - Digite: `localStorage.getItem('token')`
   - Copie o token
   - Acesse: https://jwt.io
   - Cole o token
   - Veja o campo `role` no payload

---

## ✅ Após Atualizar a Role

1. **Faça logout** no frontend
2. **Faça login novamente** (para gerar novo token com role ADMIN)
3. **Teste criar/editar uma quadra**
4. **Teste fazer upload de imagem**

---

## 🎯 Resumo Rápido

**Problema:** Usuário tem role `VISITOR`, mas precisa de `ADMIN`

**Solução:**
1. Atualize no banco: `UPDATE users SET role = 'ADMIN' WHERE email = 'seu_email';`
2. Faça logout e login novamente
3. Teste novamente

---

## 📝 Nota

Para produção, considere:
- Criar um endpoint administrativo para gerenciar roles
- Implementar um sistema de convites para ADMIN
- Adicionar validação para evitar que qualquer um se torne ADMIN

---

**Após atualizar a role, o erro 403 deve desaparecer!** 🚀
