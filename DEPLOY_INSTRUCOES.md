# Instruções para Deploy - Módulo de Quadras

## ✅ Checklist antes do Deploy

### Backend (Railway)
- [x] Schema Prisma atualizado com campos de preço e horários nobres
- [x] Migration criada (`add_pricing_fields`)
- [x] Scripts de build e start configurados
- [x] Endpoints de disponibilidade implementados
- [x] Endpoint de cópia de configurações implementado

### Frontend (Vercel)
- [x] Interface de configuração de quadras completa
- [x] Interface de horários semanais com horários nobres
- [x] Interface de replicação com horários nobres
- [x] Interface de datas específicas com horários nobres
- [x] Interface de cópia de configurações

---

## 🚀 Deploy no Railway (Backend)

### 1. Verificar Variáveis de Ambiente
Certifique-se de que as seguintes variáveis estão configuradas no Railway:

- `DATABASE_URL` - URL do banco de dados PostgreSQL
- `JWT_SECRET` - Chave secreta para JWT
- `FRONTEND_URL` - URL do frontend (sem barra final, ex: `https://uarenas.vercel.app`)
- `IMGUR_CLIENT_ID` - (Opcional) Client ID do Imgur para upload de imagens
  - **Como obter**: Veja o arquivo `backend/COMO_CONFIGURAR_IMGUR.md`
  - **Nota**: Se não configurar, o sistema usa um Client ID público (pode ter limitações)
- `PORT` - (Opcional) Porta do servidor (padrão: 3001)

### 2. Aplicar Migrations
O Railway aplicará automaticamente as migrations ao iniciar (via script `railway:start`).

**Se precisar aplicar manualmente:**
```bash
cd backend
npm run prisma:migrate:deploy
```

### 3. Verificar Deploy
Após o deploy, teste o endpoint de health:
```
GET https://seu-backend.railway.app/health
```

---

## 🚀 Deploy no Vercel (Frontend)

### 1. Verificar Variáveis de Ambiente
No painel do Vercel, configure:

- `NEXT_PUBLIC_API_URL` - URL do backend no Railway (ex: `https://seu-backend.railway.app`)

### 2. Deploy Automático
Se o repositório estiver conectado ao Vercel, o deploy será automático ao fazer push.

**Para deploy manual:**
```bash
cd frontend
vercel --prod
```

### 3. Verificar Deploy
Acesse a URL do Vercel e teste:
- Login
- Listagem de quadras
- Criação/edição de quadras
- Configuração de horários
- Marcação de horários nobres

---

## 📋 Funcionalidades Implementadas

### Módulo de Quadras
✅ Cadastro e edição de quadras
✅ Upload de imagens (Imgur)
✅ Configuração de valores (padrão e nobre)
✅ Configuração de horários semanais
✅ Marcação de horários nobres
✅ Replicação de horários (dias de semana/finais de semana)
✅ Configuração de datas específicas
✅ Cópia de configurações entre quadras
✅ Validação de conflitos de horários

---

## 🔍 Verificações Pós-Deploy

### Backend
1. Health check: `GET /health`
2. Listar quadras: `GET /courts`
3. Criar quadra: `POST /courts` (com autenticação)
4. Configurar disponibilidade: `POST /courts/:id/availability`

### Frontend
1. Acessar tela de login
2. Fazer login
3. Acessar página de quadras
4. Criar uma quadra
5. Configurar horários
6. Marcar horários como nobres
7. Testar replicação
8. Testar cópia de configurações

---

## 🐛 Troubleshooting

### Erro: "Campo não encontrado"
- Verifique se as migrations foram aplicadas
- Execute: `npm run prisma:migrate:deploy` no Railway

### Erro de CORS
- Verifique se `FRONTEND_URL` está correto (sem barra final)
- Verifique se a URL do frontend no Vercel está na variável

### Imagens não aparecem
- Verifique se o `IMGUR_CLIENT_ID` está configurado
- Ou use URLs diretas de imagens

---

## 📝 Notas Importantes

1. **Migrations**: O Railway aplica migrations automaticamente no startup
2. **CORS**: Certifique-se de que `FRONTEND_URL` está sem barra final
3. **Banco de Dados**: As migrations são aplicadas automaticamente, mas verifique os logs se houver problemas
4. **Build**: O frontend precisa ser rebuildado no Vercel após mudanças

---

## ✅ Próximos Passos

Após o deploy bem-sucedido:
1. Testar todas as funcionalidades
2. Criar usuário administrador (se ainda não tiver)
3. Configurar as primeiras quadras
4. Testar reservas (próximo módulo)
