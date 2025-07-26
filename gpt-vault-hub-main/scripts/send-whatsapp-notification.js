#!/usr/bin/env node

// Send a WhatsApp notification using the Twilio helper library.
// Example usage:
//   TWILIO_ACCOUNT_SID=ACXXXX TWILIO_AUTH_TOKEN=token \
//   node scripts/send-whatsapp-notification.js "Nova reserva criada"

import twilio from 'twilio';

const message = process.argv.slice(2).join(' ');
if (!message) {
  console.error('Usage: node scripts/send-whatsapp-notification.js "message"');
  process.exit(1);
}

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM = 'whatsapp:+14155238886',
  // Default to the customer-provided number
  TWILIO_WHATSAPP_TO = 'whatsapp:+5516996233199',
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
  process.exit(1);
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

client.messages
  .create({
    from: TWILIO_WHATSAPP_FROM,
    to: TWILIO_WHATSAPP_TO,
    body: message,
  })
  .then(msg => {
    console.log('Message sent:', msg.sid);
  })
  .catch(err => {
    console.error('Failed to send message:', err.message);
    process.exit(1);
  });
