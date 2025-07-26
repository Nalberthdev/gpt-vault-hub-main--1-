#!/usr/bin/env node

// Envia uma notificação via WhatsApp usando a biblioteca Twilio.
// Uso:
//   TWILIO_ACCOUNT_SID=ACXXXX TWILIO_AUTH_TOKEN=token \
//   node scripts/send-whatsapp-notification.js "Nova reserva criada"

import twilio from 'twilio';
import 'dotenv/config';

const message = process.argv.slice(2).join(' ');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM = 'whatsapp:+14155238886',
  TWILIO_WHATSAPP_TO = 'whatsapp:+5516996233199',
  TWILIO_CONTENT_SID,
  TWILIO_CONTENT_VARIABLES,
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error('Erro: TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN devem estar definidos.');
  process.exit(1);
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const params = {
  from: TWILIO_WHATSAPP_FROM,
  to: TWILIO_WHATSAPP_TO,
};

// Enviar usando template (Content SID)
if (TWILIO_CONTENT_SID) {
  params.contentSid = TWILIO_CONTENT_SID;
  if (TWILIO_CONTENT_VARIABLES) {
    params.contentVariables = TWILIO_CONTENT_VARIABLES;
  }

  if (message) {
    console.warn(
      '⚠️ Ignorando mensagem da CLI porque TWILIO_CONTENT_SID está definido. Use TWILIO_CONTENT_VARIABLES para customizar.'
    );
  }
} else {
  if (!message) {
    console.error('Uso: node scripts/send-whatsapp-notification.js "mensagem"');
    process.exit(1);
  }
  params.body = message;
}

// Enviar mensagem
client.messages
  .create(params)
  .then(msg => {
    console.log('✅ Mensagem enviada com sucesso:', msg.sid);
  })
  .catch(err => {
    const code = err?.code ? ` (código ${err.code})` : '';
    console.error('❌ Falha ao enviar mensagem:', err.message + code);
    process.exit(1);
  });
