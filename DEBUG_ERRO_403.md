# 🔍 Debug: Erro 403 com Role ADMIN

## ✅ Verificações

O usuário já tem role `ADMIN` no banco, mas ainda dá erro 403. Vamos debugar:

---

## 🔍 Passo 1: Verificar Token JWT Atual

No console do navegador (F12), execute:

```javascript
const token = localStorage.getItem('token');
if (token) {
  try {
    // Decodifica o payload do token (sem verificar assinatura)
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('📋 Token Payload:', payload);
    console.log('👤 Role no Token:', payload.role);
    
    // Verifica user no localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('👤 User no localStorage:', user);
    console.log('👤 Role no localStorage:', user.role);
  } catch (e) {
    console.error('❌ Erro ao decodificar token:', e);
  }
} else {
  console.log('❌ Nenhum token encontrado');
}
```

**Resultado esperado:**
- Role no token pode ser antiga (isso é OK, o backend busca do banco)
- Role no localStorage deve ser "ADMIN"

---

## 🔍 Passo 2: Testar Endpoint Diretamente

No console do navegador, execute:

```javascript
(async () => {
  const apiUrl = 'https://uarena.up.railway.app';
  const token = localStorage.getItem('token');
  
  try {
    // Testa endpoint de quadras
    const response = await fetch(`${apiUrl}/courts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Teste',
        sportType: 'esportes_areia'
      })
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('📋 Response:', data);
    
    if (response.status === 403) {
      console.error('❌ 403 Forbidden - Verifique role do usuário no banco');
    } else if (response.status === 201 || response.status === 200) {
      console.log('✅ Sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
})();
```

---

## 🔍 Passo 3: Verificar se Backend Está Usando Role do Banco

O `JwtStrategy.validate()` busca a role do banco de dados. Isso significa que mesmo com token antigo, a role deve ser atualizada.

**Verifique os logs do backend no Railway:**
1. Acesse: https://railway.app
2. Selecione o serviço do backend
3. Vá em **"Deployments"** → **"View Logs"**
4. Veja se há erros relacionados a role/autenticação

---

## 🔄 Passo 4: Fazer Logout e Login Novamente

Mesmo que o backend busque a role do banco, é uma boa prática fazer logout/login:

1. **No frontend**, clique em **"Logout"** ou **"Sair"**
2. **Faça login novamente**
3. **Teste criar/editar uma quadra**

---

## 🐛 Possíveis Problemas

### Problema 1: Backend Não Está Rodando Código Atualizado

Se o backend não foi deployado com as últimas alterações do `JwtStrategy`, pode estar usando a role do token em vez do banco.

**Solução:** Force um redeploy no Railway

### Problema 2: Problema com JWT_SECRET

Se o `JWT_SECRET` mudou, os tokens antigos podem não ser válidos.

**Solução:** Faça logout/login novamente

### Problema 3: Cache do Navegador

O navegador pode estar usando um token antigo em cache.

**Solução:**
1. Abra o DevTools (F12)
2. Application → Local Storage → Limpe os dados
3. Faça login novamente

---

## ✅ Solução Rápida: Limpar e Fazer Login Novamente

Execute no console do navegador:

```javascript
// Limpa tudo
localStorage.clear();
sessionStorage.clear();

// Recarrega a página
window.location.href = '/login';
```

Depois:
1. Faça login novamente
2. Teste criar/editar uma quadra

---

## 📋 Checklist

- [ ] Usuário tem role `ADMIN` no banco ✅
- [ ] Token JWT foi decodificado e verificado
- [ ] Endpoint testado diretamente
- [ ] Logs do backend verificados
- [ ] Logout/login feito novamente
- [ ] Cache do navegador limpo
- [ ] Teste criar/editar quadra funciona

---

**Execute os códigos acima no console e me diga o que aparece!** 🔍
