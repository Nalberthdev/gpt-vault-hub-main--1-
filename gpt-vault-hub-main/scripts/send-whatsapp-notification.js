#!/usr/bin/env node

// Envia uma notificação via WhatsApp usando a biblioteca Twilio.
// Uso:
//   TWILIO_ACCOUNT_SID=ACXXXX TWILIO_AUTH_TOKEN=token \
//   node scripts/send-whatsapp-notification.js "Nova reserva criada"

import twilio from 'twilio';
import 'dotenv/config';

const cliMessage = process.argv.slice(2).join(' ');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM = 'whatsapp:+14155238886',
  TWILIO_WHATSAPP_TO = 'whatsapp:+5516996233199',
  TWILIO_CONTENT_SID,
  TWILIO_CONTENT_VARIABLES,
  APPOINTMENT_NAME,
  APPOINTMENT_DATE,
  APPOINTMENT_TIME,
  APPOINTMENT_PHONE,
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error('Erro: TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN devem estar definidos.');
  process.exit(1);
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const params: any = {
  from: TWILIO_WHATSAPP_FROM,
  to: TWILIO_WHATSAPP_TO,
};

function buildEnvMessage() {
  if (
    APPOINTMENT_NAME ||
    APPOINTMENT_DATE ||
    APPOINTMENT_TIME ||
    APPOINTMENT_PHONE
  ) {
    return `Agendamento Confirmado!\nNome: ${APPOINTMENT_NAME || ''}\nData: ${
      APPOINTMENT_DATE || ''
    }\nHorário: ${APPOINTMENT_TIME || ''}\n\nTelefone: ${
      APPOINTMENT_PHONE || ''
    }\n\nAnote essas informações! Chegue 10 minutos antes do horário agendado.`;
  }
  return '';
}

if (TWILIO_CONTENT_SID) {
  params.contentSid = TWILIO_CONTENT_SID;
  if (TWILIO_CONTENT_VARIABLES) {
    params.contentVariables = TWILIO_CONTENT_VARIABLES;
  }

  if (cliMessage) {
    console.warn(
      '⚠️ Ignorando mensagem da CLI porque TWILIO_CONTENT_SID está definido. Use TWILIO_CONTENT_VARIABLES para customizar.'
    );
  }
} else {
  const msg = cliMessage || buildEnvMessage();
  if (!msg) {
    console.error(
      'Uso: node scripts/send-whatsapp-notification.js "mensagem" ou defina as variáveis APPOINTMENT_* no .env'
    );
    process.exit(1);
  }
  params.body = msg;
}

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
