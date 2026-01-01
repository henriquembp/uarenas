# 🔧 Atualizar Role do Usuário para ADMIN

## ❌ Problema

Erro **"Forbidden resource" (403)** porque o usuário tem role `VISITOR` mas precisa de `ADMIN` para:
- Criar/editar quadras
- Fazer upload de imagens

---

## ✅ Solução Rápida: Via API

O endpoint `PATCH /users/:id` não requer role ADMIN, então você pode atualizar sua própria role.

### Passo 1: Obter seu User ID

1. **Abra o console do navegador (F12)**
2. **Vá na aba "Application" ou "Storage"**
3. **Local Storage** → `uarenas.vercel.app`
4. **Copie o valor de `user`** (é um JSON)
5. **Procure o campo `id`** no JSON

**Ou via API:**
```javascript
// No console do navegador
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));
console.log('User ID:', user.id);
```

### Passo 2: Atualizar Role via API

**Opção A - Via Console do Navegador:**

1. Abra o console (F12)
2. Cole este código:

```javascript
(async () => {
  const apiUrl = 'https://uarena.up.railway.app';
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  try {
    const response = await fetch(`${apiUrl}/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: 'ADMIN' })
    });
    
    const data = await response.json();
    console.log('✅ Role atualizada!', data);
    
    // Atualiza o user no localStorage
    localStorage.setItem('user', JSON.stringify({ ...user, role: 'ADMIN' }));
    
    alert('Role atualizada para ADMIN! Faça logout e login novamente.');
  } catch (error) {
    console.error('❌ Erro:', error);
    alert('Erro ao atualizar role: ' + error.message);
  }
})();
```

**Opção B - Via curl/Postman:**

```bash
curl -X PATCH https://uarena.up.railway.app/users/SEU_USER_ID \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

### Passo 3: Fazer Logout e Login Novamente

1. **Faça logout** no frontend
2. **Faça login novamente** (para gerar novo token JWT com role ADMIN)
3. **Teste criar/editar uma quadra**

---

## ✅ Solução Alternativa: Via Banco de Dados

Se a API não funcionar, atualize diretamente no banco:

1. **Acesse o banco do Railway:**
   - Railway → Serviço do banco → **"Data"** ou **"Query"**

2. **Execute:**
   ```sql
   UPDATE users 
   SET role = 'ADMIN' 
   WHERE email = 'seu_email@exemplo.com';
   ```

3. **Faça logout e login novamente**

---

## 🧪 Verificar se Funcionou

Após fazer login novamente:

1. **Abra o console (F12)**
2. **Digite:**
   ```javascript
   const user = JSON.parse(localStorage.getItem('user'));
   console.log('Role:', user.role); // Deve ser "ADMIN"
   ```

3. **Tente criar uma quadra** - deve funcionar! ✅

---

## 🎯 Resumo

1. Execute o código JavaScript no console do navegador
2. Faça logout e login novamente
3. Teste criar/editar quadra

**Pronto!** 🚀
