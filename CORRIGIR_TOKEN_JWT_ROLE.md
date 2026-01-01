# 🔧 Corrigir Token JWT com Role Antiga

## ❌ Problema

O usuário já tem role `ADMIN` no banco de dados, mas ainda recebe erro 403 "Forbidden resource".

**Causa:** O token JWT foi gerado **antes** da role ser atualizada para ADMIN. O token JWT contém a role no momento do login e não é atualizado automaticamente.

---

## ✅ Solução: Fazer Login Novamente

O token JWT precisa ser regenerado com a role atualizada.

### Passo 1: Fazer Logout

1. **No frontend**, clique em **"Logout"** ou **"Sair"**
2. Isso limpa o token antigo do `localStorage`

### Passo 2: Fazer Login Novamente

1. **Faça login** com suas credenciais
2. Isso vai gerar um **novo token JWT** com a role `ADMIN` atual

### Passo 3: Verificar se Funcionou

Após fazer login:

1. **Abra o console do navegador (F12)**
2. **Digite:**
   ```javascript
   const user = JSON.parse(localStorage.getItem('user'));
   console.log('Role:', user.role); // Deve ser "ADMIN"
   ```

3. **Verifique o token JWT:**
   ```javascript
   const token = localStorage.getItem('token');
   // Cole o token em https://jwt.io para ver o payload
   // O campo "role" deve ser "ADMIN"
   ```

4. **Teste criar/editar uma quadra** - deve funcionar! ✅

---

## 🔍 Por Que Isso Acontece?

O JWT (JSON Web Token) é gerado no momento do login e contém:
- Email do usuário
- ID do usuário
- **Role do usuário no momento do login**

Quando você atualiza a role no banco de dados, o token JWT antigo **não é atualizado automaticamente**. Ele só é atualizado quando você faz login novamente.

**Exemplo do payload JWT:**
```json
{
  "email": "seu_email@exemplo.com",
  "sub": "user_id",
  "role": "ADMIN"  // ← Esta role é definida no momento do login
}
```

---

## 🧪 Verificar Token Atual (Debug)

Para verificar qual role está no token atual:

1. **Abra o console (F12)**
2. **Cole este código:**
   ```javascript
   const token = localStorage.getItem('token');
   if (token) {
     // Decodifica o token (sem verificar assinatura)
     const payload = JSON.parse(atob(token.split('.')[1]));
     console.log('Token payload:', payload);
     console.log('Role no token:', payload.role);
     console.log('Role no localStorage:', JSON.parse(localStorage.getItem('user')).role);
   }
   ```

**Se a role no token for diferente de "ADMIN":**
- Faça logout e login novamente

**Se a role no token já for "ADMIN" mas ainda dá erro:**
- Verifique se o backend está validando corretamente
- Veja os logs do backend no Railway

---

## 🐛 Se Ainda Não Funcionar

### 1. Limpar Cache do Navegador

1. Abra o DevTools (F12)
2. Clique com botão direito no botão de recarregar
3. Selecione **"Limpar cache e recarregar forçadamente"**

### 2. Verificar Logs do Backend

1. Acesse: https://railway.app
2. Selecione o serviço do backend
3. Vá em **"Deployments"** → **"View Logs"**
4. Veja se há erros relacionados a autenticação/role

### 3. Testar Endpoint Diretamente

```bash
curl -X POST https://uarena.up.railway.app/courts \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste", "sportType": "esportes_areia"}'
```

Se retornar 403, o token ainda tem role antiga.

---

## ✅ Checklist

- [ ] Usuário tem role `ADMIN` no banco de dados ✅
- [ ] Fez logout no frontend
- [ ] Fez login novamente
- [ ] Token JWT foi regenerado
- [ ] Role no token é `ADMIN`
- [ ] Teste criar/editar quadra funciona

---

## 🎯 Resumo

1. **Faça logout** no frontend
2. **Faça login novamente** para regenerar o token
3. **Teste** criar/editar uma quadra

**O token JWT é gerado no login e não é atualizado automaticamente quando você muda a role no banco!** 🔑
