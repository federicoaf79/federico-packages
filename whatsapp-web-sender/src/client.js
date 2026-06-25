/**
 * WhatsApp Sender Client
 * Para usar desde cualquier app del ecosistema Tulkas (Dentalab, OOH, Comunas, etc.)
 *
 * Instalación en el proyecto consumidor:
 *   Copiar este archivo a src/lib/whatsappClient.js
 *
 * Uso:
 *   import { sendOC, sendMensaje } from './lib/whatsappClient';
 *
 *   // Enviar OC como PDF base64
 *   await sendOC({
 *     phone: '5491112345678',
 *     pdfBase64: 'JVBERi0xLjQ...',
 *     nroOC: 'OC-2026-001',
 *     nombreProveedor: 'Distribuidora Dental SA'
 *   });
 *
 *   // Enviar mensaje de texto
 *   await sendMensaje('5491112345678', 'Hola, les paso la OC adjunta.');
 */

const WA_SERVER_URL = process.env.WA_SENDER_URL || 'http://localhost:3099';
const WA_API_KEY = process.env.WA_API_KEY || 'tulkas-wa-2026';

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': WA_API_KEY,
};

// ── VERIFICAR ESTADO ──
export async function getStatus() {
  const res = await fetch(`${WA_SERVER_URL}/status`, { headers });
  return res.json();
}

// ── ENVIAR MENSAJE DE TEXTO ──
export async function sendMensaje(phone, message) {
  const res = await fetch(`${WA_SERVER_URL}/send/message`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ phone, message }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Error al enviar mensaje');
  return data;
}

// ── ENVIAR ORDEN DE COMPRA (PDF en base64) ──
export async function sendOC({ phone, pdfBase64, nroOC, nombreProveedor, caption }) {
  const res = await fetch(`${WA_SERVER_URL}/send/oc`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ phone, pdfBase64, nroOC, nombreProveedor, caption }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Error al enviar OC');
  return data;
}

// ── ENVIAR ARCHIVO GENÉRICO (desde URL pública) ──
// Para cuando el PDF está hosteado en Supabase Storage
export async function sendArchivoDesdeURL(phone, fileUrl, caption) {
  // Descargar el archivo y convertir a base64
  const fileRes = await fetch(fileUrl);
  const buffer = await fileRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  const res = await fetch(`${WA_SERVER_URL}/send/oc`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ phone, pdfBase64: base64, nroOC: 'DOC', caption }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Error al enviar archivo');
  return data;
}
