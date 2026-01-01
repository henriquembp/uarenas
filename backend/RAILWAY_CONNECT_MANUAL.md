# 🔗 Conectar Serviços Manualmente no Railway

## Método 1: Usando "Add Reference" (Recomendado)

### Passo a Passo:

1. **No serviço `uarena-code`**, vá na aba **"Variables"**

2. **Clique no botão "Add Reference"** (que aparece ao lado de "Add Variable")

3. **Na janela que abrir**, você verá:
   - Uma lista de serviços disponíveis
   - Procure por **`uarena-db`**
   - Expanda o serviço `uarena-db`
   - Você verá as variáveis disponíveis, geralmente:
     - `DATABASE_URL` (esta é a que você precisa!)
     - `PGHOST`
     - `PGPORT`
     - `PGUSER`
     - `PGPASSWORD`
     - `PGDATABASE`

4. **Selecione `DATABASE_URL`** do serviço `uarena-db`

5. **Nome da variável:** Deixe como `DATABASE_URL` (ou crie um alias se preferir)

6. **Clique em "Add"** ou "Save"

✅ Pronto! A variável `DATABASE_URL` será criada automaticamente apontando para o banco.

---

## Método 2: Adicionar Manualmente (Se o Método 1 não funcionar)

Se você não conseguir usar "Add Reference", você pode adicionar manualmente:

### Passo 1: Descobrir a URL do banco

1. **Clique no serviço `uarena-db`** (PostgreSQL)
2. Vá na aba **"Variables"**
3. Procure pela variável **`DATABASE_URL`** ou **`POSTGRES_URL`**
4. **Copie o valor completo** (será algo como: `postgresql://postgres:senha@host:5432/railway`)

### Passo 2: Adicionar no uarena-code

1. **Volte para o serviço `uarena-code`**
2. Vá em **"Variables"**
3. Clique em **"Add Variable"**
4. Preencha:
   - **VARIABLE_NAME:** `DATABASE_URL`
   - **VALUE:** Cole a URL que você copiou do `uarena-db`
5. Clique em **"Add"**

⚠️ **Nota:** Este método não é ideal porque se o banco reiniciar, a URL pode mudar. O Método 1 é melhor porque mantém a referência automática.

---

## Método 3: Usando Sintaxe de Referência (Avançado)

Se os métodos acima não funcionarem, você pode usar a sintaxe de referência do Railway:

1. **No `uarena-code`**, adicione uma variável:
   - **VARIABLE_NAME:** `DATABASE_URL`
   - **VALUE:** `${{uarena-db.DATABASE_URL}}`

   Ou tente:
   - **VALUE:** `${{uarena-db.POSTGRES_URL}}`
   - **VALUE:** `${{uarena-db.PGDATABASE_URL}}`

2. O Railway vai substituir automaticamente pela URL real do banco.

---

## 🔍 Verificar se Funcionou

Depois de adicionar a variável:

1. **Na aba "Variables"** do `uarena-code`
2. Você deve ver `DATABASE_URL` listada
3. O valor deve começar com `postgresql://` ou mostrar uma referência ao `uarena-db`

---

## ❓ Se Ainda Não Funcionar

### Verifique:

1. **Os serviços estão no mesmo projeto?**
   - Ambos devem aparecer na lista de serviços à esquerda
   - Ambos devem estar no mesmo ambiente (production)

2. **O serviço `uarena-db` está Online?**
   - Verifique se mostra "Online" no card do serviço

3. **Tente recarregar a página**
   - Às vezes a interface precisa atualizar

4. **Use o Método 2 temporariamente**
   - Adicione manualmente copiando a URL
   - Depois você pode tentar conectar de outra forma

---

## 📝 Próximos Passos

Depois de conectar:

1. ✅ Adicione as outras variáveis (JWT_SECRET, PORT, etc)
2. ✅ Configure Build e Start commands
3. ✅ Faça deploy

