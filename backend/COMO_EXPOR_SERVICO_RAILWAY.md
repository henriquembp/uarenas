# 🌐 Como Expor o Serviço no Railway (Gerar URL Pública)

## Problema
Seu serviço está como **"Unexposed service"**, o que significa que ele não tem uma URL pública ainda. Você precisa gerar um domínio.

---

## ✅ Solução: Gerar Domínio Público

### Passo 1: Ir para Settings
1. Na mesma página onde você está, clique na aba **"Settings"** (ao lado de "Deployments")
2. Role a página para baixo

### Passo 2: Encontrar a Seção "Networking" ou "Public Networking"
1. Procure por uma seção chamada **"Networking"** ou **"Public Networking"**
2. Ou procure por **"Domains"** ou **"Public Domain"**

### Passo 3: Gerar o Domínio
1. Você verá algo como:
   - Um botão **"Generate Domain"** ou **"Generate Public Domain"**
   - OU um botão **"Expose"** ou **"Make Public"**
   - OU uma opção **"Public Domain"** com um botão de toggle/switch

2. Clique no botão para gerar o domínio

3. O Railway vai gerar automaticamente uma URL como:
   - `https://uarena-code-production.up.railway.app`
   - OU `https://uarena-code-production-xxxx.up.railway.app`

---

## 📸 Onde Clicar (Visual)

Na aba **Settings**, você deve procurar por:

```
┌─────────────────────────────────────┐
│ Settings                            │
├─────────────────────────────────────┤
│ Service Name                        │
│ ...                                 │
│                                     │
│ Networking                          │
│ ┌─────────────────────────────────┐ │
│ │ Public Domain                   │ │
│ │ [Generate Domain] ← CLIQUE AQUI │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ...                                 │
└─────────────────────────────────────┘
```

---

## ⚠️ Alternativa: Via Aba "Networking"

Se não encontrar em Settings, tente:

1. No topo da página, procure por uma aba **"Networking"** (pode estar ao lado de "Architecture", "Observability", etc.)
2. Clique nela
3. Procure por opções relacionadas a "Public Domain" ou "Expose Service"

---

## ✅ Depois de Gerar o Domínio

1. **A URL aparecerá** na seção "Networking" ou "Public Domain"
2. **Copie essa URL** - ela será algo como:
   ```
   https://uarena-code-production.up.railway.app
   ```
3. **Use essa URL no Postman**:
   - Abra a collection no Postman
   - Edite a variável `base_url`
   - Cole a URL do Railway
   - Salve

---

## 🧪 Teste Rápido

Depois de gerar o domínio, teste no navegador:
```
https://sua-url-gerada.up.railway.app/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "arenas-backend"
}
```

---

## 💡 Dica

- O domínio é gerado automaticamente e é **gratuito**
- Você pode renomear o domínio depois em Settings → Networking → Public Domain
- O domínio fica ativo enquanto o serviço estiver rodando

---

Se ainda não encontrar, me avise e eu te ajudo de outra forma! 😊

