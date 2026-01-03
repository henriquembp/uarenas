# Configuração do Serviço de Mensagens WhatsApp

Este documento explica como configurar o serviço de mensagens WhatsApp na aplicação.

## Opções Disponíveis

### 1. Twilio (Recomendado para começar)

**Vantagens:**
- Fácil configuração
- Confiável e estável
- Boa documentação
- Suporte técnico

**Desvantagens:**
- Custo por mensagem (aproximadamente R$ 0,10 - R$ 0,30 por mensagem)
- Requer conta Twilio

**Configuração:**

1. Crie uma conta em [Twilio](https://www.twilio.com/)
2. Ative o WhatsApp Sandbox ou solicite um número WhatsApp Business
3. Adicione as variáveis de ambiente no `.env`:

```env
MESSAGING_PROVIDER=TWILIO
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # Número do Twilio (sandbox ou aprovado)
```

### 2. Evolution API (Self-hosted)

**Vantagens:**
- Gratuito (sem custo por mensagem)
- Controle total
- Open source

**Desvantagens:**
- Requer servidor próprio
- Mais complexo de configurar
- Risco de bloqueio se mal configurado

**Configuração:**

1. Instale e configure a Evolution API (veja documentação: https://evolution-api.com/)
2. Adicione as variáveis de ambiente no `.env`:

```env
MESSAGING_PROVIDER=EVOLUTION_API
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua_api_key
EVOLUTION_INSTANCE_NAME=nome_da_instancia
```

### 3. WhatsApp Business API (Meta)

**Vantagens:**
- API oficial do WhatsApp
- Sem intermediários

**Desvantagens:**
- Processo de aprovação complexo
- Requer Business Manager do Meta
- Pode levar semanas para aprovação

**Configuração:**

1. Configure um WhatsApp Business Account no Meta Business Manager
2. Obtenha o Phone Number ID e Access Token
3. Adicione as variáveis de ambiente no `.env`:

```env
MESSAGING_PROVIDER=WHATSAPP_BUSINESS
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_ACCESS_TOKEN=seu_access_token
```

## Funcionalidades Implementadas

O serviço de mensagens está integrado automaticamente nos seguintes eventos:

1. **Reserva Criada**: Envia confirmação quando uma reserva é criada
2. **Invoice Gerada**: Envia notificação quando uma fatura é criada (reserva ou mensalidade)

## Uso Manual

Você também pode enviar mensagens manualmente via API:

```bash
POST /messaging/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "to": "5511999999999",  // Número com código do país (Brasil: 55)
  "message": "Sua mensagem aqui"
}
```

## Formato de Número

O serviço aceita números em qualquer formato e converte automaticamente para o formato internacional:
- `(11) 99999-9999` → `5511999999999`
- `11 99999-9999` → `5511999999999`
- `11999999999` → `5511999999999`
- `+55 11 99999-9999` → `5511999999999`

## Logs

Todas as tentativas de envio são logadas. Erros não bloqueiam o fluxo principal da aplicação.

## Próximos Passos

- [ ] Implementar fila de mensagens para garantir entrega
- [ ] Adicionar histórico de mensagens enviadas
- [ ] Implementar templates de mensagens
- [ ] Adicionar webhook para receber mensagens
- [ ] Implementar agendamento de mensagens (lembretes)
