# 🔄 Criar Migration para Disponibilidade de Quadras

## ✅ Schema Atualizado

O schema Prisma foi atualizado com o modelo `CourtAvailability`.

---

## 🚀 Criar e Aplicar a Migration

### 1. Criar a Migration

```powershell
cd "C:\Trabalho\Repositorio Pessoal\Arenas\backend"
npm run prisma:migrate
```

Quando perguntar o nome da migration, use:
```
add_court_availability
```

### 2. Aplicar no Banco Local

A migration será aplicada automaticamente no banco local.

### 3. Aplicar no Railway

Depois de fazer commit e push, o Railway aplicará automaticamente (via `railway:start`).

---

## 📋 O Que a Migration Cria

A tabela `court_availability` com:
- `id` (UUID)
- `courtId` (referência à quadra)
- `dayOfWeek` (0-6, onde 0 = Domingo)
- `timeSlot` (formato HH:mm, ex: "14:00", "14:30")
- `createdAt` e `updatedAt`

**Constraint único:** Não pode ter o mesmo horário duplicado para a mesma quadra no mesmo dia.

---

## ✅ Depois da Migration

1. **Teste localmente:**
   - Acesse a página de quadras
   - Clique em "Configurar Horários" em uma quadra
   - Selecione os horários disponíveis
   - Salve

2. **Faça commit:**
   ```powershell
   git add .
   git commit -m "feat: add court availability system with weekly schedule"
   git push
   ```

---

**Execute a migration e teste!** 🚀

