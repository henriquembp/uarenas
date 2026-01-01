# 📸 Configuração do Upload para Imgur

## ✅ Implementação Completa

O sistema de upload automático para Imgur está implementado!

---

## 🔧 Como Funciona

1. **Usuário seleciona uma imagem** do computador
2. **Frontend envia** para o backend (`POST /upload/image`)
3. **Backend faz upload** para Imgur automaticamente
4. **Imgur retorna a URL** da imagem
5. **URL é salva** no banco de dados

---

## 🔑 Client ID do Imgur (Opcional)

Por padrão, o sistema usa um Client ID público do Imgur que funciona para testes.

**Para produção, recomendo criar seu próprio Client ID:**

1. Acesse: https://api.imgur.com/oauth2/addclient
2. Faça login no Imgur
3. Crie uma nova aplicação:
   - **Application name:** Arenas Backend
   - **Authorization type:** Anonymous usage without user authorization
   - **Authorization callback URL:** (deixe vazio)
   - **Application website:** (opcional)
   - **Email:** (seu email)
   - **Description:** Upload de imagens para sistema de gestão de arenas
4. Copie o **Client ID** gerado
5. Adicione no Railway como variável de ambiente:
   - Nome: `IMGUR_CLIENT_ID`
   - Valor: (o Client ID que você copiou)

---

## 📋 Variáveis de Ambiente

### No Railway (Opcional):

```
IMGUR_CLIENT_ID=seu_client_id_aqui
```

Se não configurar, o sistema usa um Client ID público (pode ter limitações de rate).

---

## 🎯 Como Usar no Frontend

1. **No formulário de quadras:**
   - Clique em "Selecionar arquivo"
   - Escolha uma imagem do computador
   - A imagem será enviada automaticamente
   - A URL será preenchida automaticamente

2. **Ou cole uma URL manualmente:**
   - Se preferir, ainda pode colar uma URL diretamente

---

## ✅ Vantagens

- ✅ Usuário não precisa criar conta no Imgur
- ✅ Upload automático e transparente
- ✅ URL é salva automaticamente
- ✅ Preview da imagem antes de salvar
- ✅ Validação de tipo e tamanho de arquivo

---

## 🔒 Segurança

- ✅ Endpoint protegido com JWT (precisa estar logado)
- ✅ Validação de tipo de arquivo (apenas imagens)
- ✅ Limite de tamanho (10MB)
- ✅ Upload feito pelo backend (não expõe Client ID no frontend)

---

## 🧪 Teste

1. Acesse a página de quadras
2. Clique em "Nova Quadra"
3. Selecione uma imagem do computador
4. Aguarde o upload (aparece "Enviando imagem...")
5. A imagem deve aparecer no preview
6. Salve a quadra

---

**Tudo pronto! O upload automático está funcionando!** 🚀

