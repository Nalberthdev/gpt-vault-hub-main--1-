#!/usr/bin/env node

// Send a WhatsApp notification using the Twilio helper library.
// Example usage:
//   TWILIO_ACCOUNT_SID=ACXXXX TWILIO_AUTH_TOKEN=token \
//   node scripts/send-whatsapp-notification.js "Nova reserva criada"

import twilio from 'twilio';

// Optional: load environment variables from a .env file if present
import 'dotenv/config';

const cliMessage = process.argv.slice(2).join(' ');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM = 'whatsapp:+14155238886',
  // Default to the customer-provided number
  TWILIO_WHATSAPP_TO = 'whatsapp:+5516996233199',
  TWILIO_CONTENT_SID,
  TWILIO_CONTENT_VARIABLES,
  APPOINTMENT_NAME,
  APPOINTMENT_DATE,
  APPOINTMENT_TIME,
  APPOINTMENT_PHONE,
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
  process.exit(1);
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const params = {
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
    }\nHor\u00E1rio: ${APPOINTMENT_TIME || ''}\n\nTelefone: ${
      APPOINTMENT_PHONE || ''
    }\n\nAnote essas informa\u00E7\u00F5es! Chegue 10 minutos antes do hor\u00E1rio agendado.`;
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
      'Ignoring CLI message because TWILIO_CONTENT_SID is set. Use TWILIO_CONTENT_VARIABLES to customize the template.'
    );
  }
} else {
  const msg = cliMessage || buildEnvMessage();
  if (!msg) {
    console.error(
      'Usage: node scripts/send-whatsapp-notification.js "message" or set APPOINTMENT_* variables.'
    );
    process.exit(1);
  }
  params.body = msg;
}

client.messages
  .create(params)
  .then(msg => {
    console.log('Message sent:', msg.sid);
  })
  .catch(err => {
    const code = err?.code ? ` (code ${err.code})` : '';
    console.error('Failed to send message:', err.message + code);
    process.exit(1);
  });
