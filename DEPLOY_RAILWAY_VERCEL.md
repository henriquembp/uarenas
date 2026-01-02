# 🚀 Deploy Railway + Vercel - Multi-tenancy e Personalização

## ✅ Checklist Antes do Deploy

### 1. Commitar Mudanças
```bash
# No diretório raiz do projeto
git add .
git commit -m "feat: implementa multi-tenancy e personalização de organizações"
git push origin main
```

### 2. Verificar Migrations
Todas as migrations devem estar na pasta `backend/prisma/migrations/`:
- ✅ `20260101223722_add_multi_tenancy` - Multi-tenancy
- ✅ `20260102111951_add_organization_branding` - Personalização (logo, cores)

---

## 🚂 Deploy no Railway (Backend)

### 1. Variáveis de Ambiente Obrigatórias

No painel do Railway, configure:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | Chave secreta JWT | `sua-chave-secreta-aqui` |
| `FRONTEND_URL` | URL do frontend (sem barra final) | `https://uarenas.vercel.app` |
| `IMGUR_CLIENT_ID` | (Opcional) Client ID do Imgur | `546c25a59c58ad7` |

### 2. Configurações do Serviço

- **Root Directory**: `backend`
- **Start Command**: `npm run railway:start`
- **Build Command**: `npm run railway:build`

### 3. Verificar Deploy

Após o deploy, teste:
```bash
GET https://seu-backend.railway.app/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-02T...",
  "service": "arenas-backend"
}
```

### 4. Aplicar Migrations (se necessário)

O Railway aplica automaticamente via `railway:start`, mas se precisar aplicar manualmente:

1. Acesse o terminal do Railway (via interface web)
2. Execute:
```bash
cd backend
npm run prisma:migrate:deploy
```

### 5. Verificar Organização Padrão

Após as migrations, verifique se a organização padrão existe:

```sql
SELECT * FROM organizations 
WHERE id = '00000000-0000-0000-0000-000000000001';
```

Se não existir, crie:
```sql
INSERT INTO organizations (id, name, subdomain, plan, "isActive", "createdAt", "updatedAt")
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Organização Padrão',
  'default',
  'FREE',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

---

## 🌐 Deploy no Vercel (Frontend)

### 1. Variáveis de Ambiente

No painel do Vercel, configure:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NEXT_PUBLIC_API_URL` | URL do backend Railway | `https://seu-backend.railway.app` |

**⚠️ IMPORTANTE**: Sem barra final na URL!

### 2. Configurações do Projeto

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)

### 3. Deploy Automático

Se o repositório estiver conectado, o deploy é automático ao fazer push.

**Para deploy manual:**
```bash
cd frontend
vercel --prod
```

### 4. Verificar Deploy

Acesse a URL do Vercel e teste:
1. ✅ Tela de login
2. ✅ Login com usuário existente
3. ✅ Dashboard com sidebar
4. ✅ Página de quadras
5. ✅ Página de configurações (`/dashboard/settings`)
6. ✅ Personalização de cores e logo

---

## 🧪 Testes Pós-Deploy

### Backend (Railway)

1. **Health Check**
   ```bash
   GET /health
   ```

2. **Login**
   ```bash
   POST /auth/login
   Body: { "email": "...", "password": "..." }
   ```

3. **Buscar Organização Atual**
   ```bash
   GET /organizations/current
   Headers: { "Authorization": "Bearer <token>" }
   ```

4. **Listar Quadras**
   ```bash
   GET /courts
   Headers: { "Authorization": "Bearer <token>" }
   ```

### Frontend (Vercel)

1. ✅ Acessar tela de login
2. ✅ Fazer login
3. ✅ Verificar sidebar com nome/logo da organização
4. ✅ Verificar cores personalizadas aplicadas
5. ✅ Acessar `/dashboard/settings`
6. ✅ Alterar cores e logo
7. ✅ Verificar se as mudanças são aplicadas imediatamente

---

## 🐛 Troubleshooting

### Erro: "Organization ID não encontrado"
- Verifique se a organização padrão existe no banco
- Execute o SQL acima para criar

### Erro: "Organização não encontrada com ID: current"
- ✅ **RESOLVIDO**: A rota `@Get('current')` agora vem antes de `@Get(':id')`

### Erro de CORS
- Verifique se `FRONTEND_URL` está sem barra final
- Verifique se a URL do Vercel está correta

### Erro: "Campo não encontrado" (logoUrl, primaryColor, etc)
- Verifique se a migration `add_organization_branding` foi aplicada
- Execute: `npm run prisma:migrate:deploy` no Railway

### Imagens não aparecem
- Verifique se `IMGUR_CLIENT_ID` está configurado no Railway
- Ou use URLs diretas de imagens

### Frontend não conecta ao backend
- Verifique se `NEXT_PUBLIC_API_URL` está configurado no Vercel
- Verifique se a URL está sem barra final
- Force um rebuild no Vercel

---

## 📋 Checklist Final

### Backend (Railway)
- [ ] Variáveis de ambiente configuradas
- [ ] Root Directory: `backend`
- [ ] Start Command: `npm run railway:start`
- [ ] Health check funcionando
- [ ] Migrations aplicadas
- [ ] Organização padrão existe no banco

### Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` configurado
- [ ] Root Directory: `frontend`
- [ ] Deploy concluído
- [ ] Login funcionando
- [ ] Personalização funcionando

---

## ✅ Próximos Passos

Após o deploy bem-sucedido:
1. Testar todas as funcionalidades
2. Criar usuário administrador (se ainda não tiver)
3. Personalizar a organização
4. Configurar as primeiras quadras
5. Testar reservas (próximo módulo)

---

**🎉 Pronto para deploy!**
