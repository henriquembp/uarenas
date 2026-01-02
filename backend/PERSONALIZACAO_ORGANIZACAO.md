# 🎨 Personalização de Organização

## 📋 Funcionalidades Implementadas

### 1. Campos de Personalização

Cada organização pode personalizar:
- **Logo/Marca** (`logoUrl`): URL da imagem da logo
- **Cor Primária** (`primaryColor`): Cor principal da interface (ex: `#3B82F6`)
- **Cor Secundária** (`secondaryColor`): Cor secundária (ex: `#8B5CF6`)
- **Cor de Destaque** (`accentColor`): Cor de destaque (ex: `#F59E0B`)

### 2. Onde a Personalização é Aplicada

- **Sidebar (Desktop e Mobile)**:
  - Logo exibida no topo (se configurada)
  - Nome da organização com cor personalizada
  - Itens de menu ativos usam a cor primária

- **Top Bar (Mobile)**:
  - Logo e nome da organização

- **Cores Dinâmicas**:
  - Aplicadas via CSS variables (`--org-primary`, `--org-secondary`, `--org-accent`)
  - Podem ser usadas em qualquer componente

---

## 🔧 Como Configurar

### Via API

**Atualizar personalização:**
```bash
PATCH /organizations/:id
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "logoUrl": "https://imgur.com/logo.png",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#8B5CF6",
  "accentColor": "#F59E0B"
}
```

**Buscar dados da organização atual:**
```bash
GET /organizations/current
Authorization: Bearer TOKEN
```

**Resposta:**
```json
{
  "id": "org-id",
  "name": "Arena Beach Tennis",
  "logoUrl": "https://imgur.com/logo.png",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#8B5CF6",
  "accentColor": "#F59E0B",
  "subdomain": "arena-beach",
  "plan": "FREE",
  "isActive": true
}
```

---

### Via Banco de Dados

```sql
UPDATE organizations
SET 
  "logoUrl" = 'https://imgur.com/logo.png',
  "primaryColor" = '#3B82F6',
  "secondaryColor" = '#8B5CF6',
  "accentColor" = '#F59E0B'
WHERE id = 'org-id';
```

---

## 🎨 Exemplos de Cores

### Azul (Padrão)
- Primary: `#3B82F6` (blue-500)
- Secondary: `#8B5CF6` (violet-500)
- Accent: `#F59E0B` (amber-500)

### Verde
- Primary: `#10B981` (emerald-500)
- Secondary: `#06B6D4` (cyan-500)
- Accent: `#F59E0B` (amber-500)

### Roxo
- Primary: `#8B5CF6` (violet-500)
- Secondary: `#EC4899` (pink-500)
- Accent: `#F59E0B` (amber-500)

### Vermelho
- Primary: `#EF4444` (red-500)
- Secondary: `#F97316` (orange-500)
- Accent: `#F59E0B` (amber-500)

---

## 📝 Upload de Logo

### Via Imgur (Recomendado)

1. Use o endpoint `/upload/image` para fazer upload da logo
2. Copie a URL retornada
3. Atualize a organização com a URL

**Exemplo:**
```bash
# 1. Upload da imagem
POST /upload/image
Authorization: Bearer TOKEN
Content-Type: multipart/form-data

# 2. Atualizar organização
PATCH /organizations/:id
{
  "logoUrl": "URL_RETORNADA_DO_UPLOAD"
}
```

### Via URL Externa

Você pode usar qualquer URL de imagem:
- Google Drive (convertida)
- Imgur
- Cloudinary
- AWS S3
- Qualquer CDN

---

## 🔄 Como Funciona no Frontend

1. **Ao carregar o dashboard**, o frontend busca os dados da organização via `GET /organizations/current`
2. **Aplica as cores** dinamicamente via CSS variables
3. **Exibe a logo** (se configurada) no header/sidebar
4. **Mostra o nome** da organização com a cor personalizada

---

## ⚠️ Validações

- **Cores**: Devem estar no formato hexadecimal (ex: `#3B82F6`)
- **Logo**: Deve ser uma URL válida de imagem
- **Campos opcionais**: Todos os campos de personalização são opcionais

---

## 🚀 Próximos Passos

- [ ] Criar tela de configurações para editar personalização
- [ ] Preview em tempo real das cores
- [ ] Upload de logo direto na interface
- [ ] Templates de cores pré-definidos
- [ ] Personalização de fontes

---

## 📚 Arquivos Modificados

- `backend/prisma/schema.prisma`: Adicionados campos de personalização
- `backend/src/organizations/organizations.controller.ts`: Endpoint `/current`
- `backend/src/organizations/organizations.service.ts`: Método `findById`
- `frontend/app/dashboard/layout.tsx`: Busca e aplica personalização
- `frontend/app/globals.css`: CSS variables para cores

---

**Pronto para personalizar!** 🎨
