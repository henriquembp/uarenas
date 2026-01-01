# 🔄 Migração: Tipo de Esporte → Tipo de Quadra

## ✅ Alterações Realizadas

### Backend
- ✅ Schema Prisma atualizado (comentário)
- ✅ DTOs atualizados para aceitar apenas `esportes_areia`
- ✅ Validação ajustada

### Frontend
- ✅ Label alterado: "Tipo de Esporte" → "Tipo de Quadra"
- ✅ Opções do select atualizadas
- ✅ Função `getSportTypeLabel` atualizada
- ✅ Valor padrão alterado para `esportes_areia`

---

## ⚠️ Dados Existentes

Se você já tem quadras cadastradas com os valores antigos (`volei`, `futevolei`, `beach_tennis`), elas continuarão funcionando, mas:

1. **No formulário de edição:** O select mostrará apenas a nova opção
2. **Na listagem:** A função `getSportTypeLabel` pode não mostrar o texto correto para valores antigos

---

## 🔧 Migração de Dados (Opcional)

Se quiser migrar os dados existentes para o novo formato:

### Opção 1: Via Prisma Studio

1. Execute: `npm run prisma:studio`
2. Abra a tabela `courts`
3. Edite manualmente cada quadra
4. Altere `sportType` para `esportes_areia`

### Opção 2: Via SQL

```sql
UPDATE courts 
SET "sportType" = 'esportes_areia' 
WHERE "sportType" IN ('volei', 'futevolei', 'beach_tennis');
```

### Opção 3: Via Script Node.js

Crie um script temporário para atualizar:

```typescript
// scripts/migrate-courts.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
  await prisma.court.updateMany({
    where: {
      sportType: {
        in: ['volei', 'futevolei', 'beach_tennis']
      }
    },
    data: {
      sportType: 'esportes_areia'
    }
  })
  console.log('Migração concluída!')
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## ✅ Próximos Passos

1. **Teste o formulário:**
   - Crie uma nova quadra
   - Verifique se o campo mostra "Tipo de Quadra"
   - Verifique se a opção está correta

2. **Se houver dados antigos:**
   - Execute a migração de dados (opção acima)
   - Ou edite manualmente via Prisma Studio

3. **Faça commit:**
   ```bash
   git add .
   git commit -m "refactor: change sport type to court type with single option"
   git push
   ```

---

**Tudo pronto! O campo agora é "Tipo de Quadra" com a opção única!** 🎉

