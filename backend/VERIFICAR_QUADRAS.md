# 🔍 Verificar Quadras no Banco de Dados

## ❓ As quadras foram excluídas?

**Resposta curta:** Provavelmente **NÃO**. As alterações no schema não deveriam excluir quadras.

---

## 🔎 Como Verificar

### 1. Verificar no Banco de Dados

Execute no Prisma Studio:

```powershell
cd backend
npm run prisma:studio
```

Depois:
1. Abra a tabela `courts`
2. Veja se as quadras ainda estão lá
3. Verifique a coluna `isActive` - se estiver `false`, elas não aparecem na listagem

### 2. Verificar via API

Agora o endpoint aceita um parâmetro para incluir inativas:

```
GET /courts?includeInactive=true
```

Isso mostrará TODAS as quadras, inclusive as inativas.

---

## 🛠️ O Que Pode Ter Acontecido

### Cenário 1: Migration com Erro
Se a migration deu erro e você executou `prisma migrate reset` ou `prisma db push --force-reset`, o banco foi resetado e as quadras foram perdidas.

**Solução:** Recriar as quadras manualmente.

### Cenário 2: Quadras Marcadas como Inativas
Se as quadras estão com `isActive: false`, elas não aparecem na listagem padrão.

**Solução:** Use `GET /courts?includeInactive=true` para vê-las e depois reative-as.

### Cenário 3: Problema na Migration
Se a migration falhou ao adicionar o campo `specificDate`, pode ter causado problemas.

**Solução:** Verifique os logs da migration.

---

## ✅ Próximos Passos

1. **Verifique no Prisma Studio:**
   ```powershell
   cd backend
   npm run prisma:studio
   ```

2. **Se as quadras estiverem lá:**
   - Verifique se `isActive = true`
   - Se estiver `false`, reative-as

3. **Se as quadras NÃO estiverem lá:**
   - Infelizmente foram perdidas
   - Você precisará recriá-las
   - Considere fazer backup antes de migrations futuras

---

## 💡 Dica: Backup Antes de Migrations

Sempre faça backup antes de migrations importantes:

```powershell
# Backup do banco (PostgreSQL)
pg_dump -h localhost -U postgres -d arenas > backup.sql
```

---

**Verifique e me diga o que encontrou!** 🔍

