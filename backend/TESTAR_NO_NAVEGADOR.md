# 🌐 Como Testar a API no Navegador

## ✅ Por Que o 404 no "/"?

O erro `404 - Cannot GET /` é **normal**! 

Seu backend é uma **API REST**, não uma aplicação web com páginas. Não há rota definida para o caminho raiz (`/`).

---

## 🔍 Como Testar no Navegador

Você precisa acessar **endpoints específicos**. Veja os exemplos:

### 1. Health Check (Recomendado para testar primeiro)

```
https://uarena.up.railway.app/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "service": "arenas-backend"
}
```

---

### 2. Listar Quadras (Público)

```
https://uarena.up.railway.app/courts
```

**Resultado esperado:**
```json
[]
```
(Array vazio se não houver quadras cadastradas)

---

## ❌ Endpoints que NÃO Funcionam no Navegador

Alguns endpoints precisam de **autenticação** ou são **POST/PATCH/DELETE** (que o navegador faz como GET), então não funcionam apenas digitando a URL:

- ❌ `/auth/login` - Precisa de POST com body
- ❌ `/auth/register` - Precisa de POST com body
- ❌ `/users` - Precisa de autenticação (Bearer token)
- ❌ `/bookings` - Precisa de autenticação

**Esses endpoints só funcionam via:**
- ✅ Postman
- ✅ Frontend (que faz requisições HTTP)
- ✅ Outros clientes HTTP (curl, fetch, axios, etc.)

---

## 🎯 Resumo

| Endpoint | Navegador | Postman | Descrição |
|----------|-----------|---------|-----------|
| `/health` | ✅ | ✅ | Health check (público) |
| `/courts` | ✅ | ✅ | Listar quadras (público) |
| `/courts/:id` | ✅ | ✅ | Ver quadra específica (público) |
| `/auth/login` | ❌ | ✅ | Login (POST) |
| `/auth/register` | ❌ | ✅ | Registro (POST) |
| `/users` | ❌ | ✅ | Listar usuários (autenticado) |
| `/bookings` | ❌ | ✅ | Listar reservas (autenticado) |

---

## 💡 Dica

Para testar a maioria dos endpoints, use o **Postman** que você já tem configurado! 

O navegador é útil apenas para:
- ✅ Verificar se a API está online (`/health`)
- ✅ Endpoints GET públicos (como `/courts`)

---

## ✅ Teste Agora

Tente acessar no navegador:

```
https://uarena.up.railway.app/health
```

Deve retornar o JSON com status "ok"! 🎉

