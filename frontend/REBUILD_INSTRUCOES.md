# 🔄 Como Fazer Rebuild do Frontend

## 🖥️ Se Está Rodando Localmente

### Next.js (Desenvolvimento)

1. **Pare o servidor** (Ctrl+C no terminal)
2. **Reinicie:**
   ```powershell
   cd frontend
   npm run dev
   ```
3. **Recarregue a página** no navegador (F5 ou Ctrl+R)

**Importante:** Next.js tem hot-reload, mas às vezes precisa reiniciar para pegar mudanças maiores.

---

## ☁️ Se Está no Vercel (Produção)

1. **Faça commit e push:**
   ```powershell
   git add frontend/app/dashboard/courts/page.tsx
   git commit -m "feat: add Google Drive URL conversion for images"
   git push
   ```

2. **Aguarde o deploy automático** no Vercel (alguns minutos)

3. **Recarregue a página** no navegador

---

## 🧪 Teste Rápido

Depois de reiniciar/recarregar:

1. Abra o console do navegador (F12)
2. Vá na aba "Console"
3. Edite uma quadra e cole o link do Google Drive
4. Veja se aparece algum erro

---

## 🔍 Verificar se a Função Está Funcionando

Adicione um `console.log` temporário para debugar:

```typescript
const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return url
  
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  const match = url.match(driveRegex)
  
  if (match) {
    const fileId = match[1]
    const converted = `https://drive.google.com/uc?export=view&id=${fileId}`
    console.log('URL original:', url)
    console.log('URL convertida:', converted)
    return converted
  }
  
  return url
}
```

Isso vai mostrar no console se a conversão está funcionando.

---

## ⚠️ Problema Comum: Google Drive Não Público

Mesmo com a conversão, se o arquivo não estiver público, a imagem não vai aparecer.

**Verifique:**
1. No Google Drive, clique com botão direito no arquivo
2. "Compartilhar" → "Alterar para qualquer pessoa com o link"
3. Salve

---

**Reinicie o servidor local ou faça push para o Vercel!** 🚀

