# Diagnóstico - Por que não recebi notificação WhatsApp?

## Checklist de Verificação

### 1. ✅ Usuário tem telefone cadastrado?
- Verifique se o usuário que fez a reserva tem um número de telefone no cadastro
- O campo `phone` no modelo `User` deve estar preenchido
- **Como verificar**: Consulte o banco de dados ou a API de usuários

### 2. ✅ Provider está configurado?
- Verifique se as variáveis de ambiente estão definidas no `.env`
- **Teste**: Acesse `GET /messaging/test` (requer autenticação ADMIN)

**Para Twilio:**
```env
MESSAGING_PROVIDER=TWILIO
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Para Evolution API:**
```env
MESSAGING_PROVIDER=EVOLUTION_API
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua_api_key
EVOLUTION_INSTANCE_NAME=nome_da_instancia
```

### 3. ✅ Verificar logs do backend
- Os logs agora mostram mensagens detalhadas sobre o envio
- Procure por:
  - `"Enviando confirmação de reserva"`
  - `"Usuário não possui telefone cadastrado"`
  - `"Provider não está configurado"`
  - `"Erro ao enviar mensagem WhatsApp"`

### 4. ✅ Testar envio manual
- Use o endpoint de teste: `POST /messaging/test-send`
- Body:
```json
{
  "to": "5511999999999",
  "message": "Teste de mensagem"
}
```

## Problemas Comuns

### Problema 1: Usuário sem telefone
**Sintoma**: Log mostra "Usuário não possui telefone cadastrado"
**Solução**: Adicione o telefone do usuário no cadastro

### Problema 2: Provider não configurado
**Sintoma**: Log mostra "Provider não está configurado corretamente"
**Solução**: Configure as variáveis de ambiente conforme o provider escolhido

### Problema 3: Twilio Sandbox
**Sintoma**: Mensagem não chega
**Solução**: 
- No Twilio Sandbox, você precisa enviar uma mensagem primeiro para o número do sandbox
- O número deve estar na lista de números permitidos do sandbox

### Problema 4: Número em formato incorreto
**Sintoma**: Erro na API do provider
**Solução**: O sistema formata automaticamente, mas verifique se o número está salvo corretamente no banco

## Como Verificar

1. **Ver logs do backend**:
   ```bash
   # Se estiver rodando localmente, veja o console
   # Se estiver em produção, veja os logs do servidor
   ```

2. **Teste a configuração**:
   ```bash
   GET /messaging/test
   Authorization: Bearer {seu_token}
   ```

3. **Teste envio manual**:
   ```bash
   POST /messaging/test-send
   Authorization: Bearer {seu_token}
   Content-Type: application/json
   
   {
     "to": "5511999999999",
     "message": "Teste"
   }
   ```

4. **Verifique o telefone do usuário**:
   ```bash
   GET /users/{userId}
   Authorization: Bearer {seu_token}
   ```

## Próximos Passos

Se após verificar tudo acima ainda não funcionar:
1. Compartilhe os logs do backend
2. Compartilhe a resposta do endpoint `/messaging/test`
3. Verifique se o número de telefone está no formato correto
