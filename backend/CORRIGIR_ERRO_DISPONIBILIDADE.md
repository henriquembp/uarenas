# 🔧 Corrigir Erro "Internal Server Error" ao Salvar Disponibilidade

## ❌ Problema

Ao salvar os horários de disponibilidade, está dando erro "Internal Server Error".

## 🔍 Causa Provável

A migration que adiciona o campo `specificDate` ao modelo `CourtAvailability` ainda não foi aplicada no banco de dados.

---

## ✅ Solução

### 1. Criar e Aplicar a Migration

Execute os seguintes comandos:

```powershell
cd "C:\Trabalho\Repositorio Pessoal\Arenas\backend"
npm run prisma:migrate
```

Quando perguntar o nome da migration, use:
```
add_specific_date_availability
```

Isso vai:
1. Criar a migration com as alterações do schema
2. Aplicar a migration no banco de dados
3. Adicionar o campo `specificDate` à tabela `court_availability`

---

### 2. Verificar se Funcionou

Após aplicar a migration, tente salvar os horários novamente. O erro deve desaparecer.

---

### 3. Se Ainda Der Erro

Verifique os logs do backend no terminal. O erro agora deve mostrar uma mensagem mais clara indicando qual é o problema.

**Possíveis erros:**
- Se aparecer "Unknown column 'specificDate'": A migration não foi aplicada
- Se aparecer erro de constraint único: Pode haver dados duplicados no banco

---

## 🛠️ Comandos Alternativos

Se `npm run prisma:migrate` não funcionar, tente:

```powershell
# Gerar o Prisma Client novamente
npm run prisma:generate

# Aplicar migrations pendentes
npm run prisma:migrate:deploy
```

---

## 📋 O Que a Migration Faz

A migration adiciona:
- Campo `specificDate` (DateTime opcional) na tabela `court_availability`
- Torna o campo `dayOfWeek` opcional (nullable)
- Adiciona constraints únicos separados para disponibilidade recorrente e específica

---

**Execute a migration e teste novamente!** 🚀

