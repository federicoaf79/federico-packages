/**
 * WhatsApp Web Sender — Servidor REST
 * Expone el módulo como una API HTTP para que cualquier app del ecosistema lo consuma
 *
 * POST /send/message   → enviar texto
 * POST /send/file      → enviar archivo
 * POST /send/oc        → enviar Orden de Compra (PDF)
 * GET  /status         → estado de la conexión
 * GET  /qr             → obtener QR como imagen base64
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { WhatsAppSender } = require('./index');

const app = express();
const PORT = process.env.PORT || 3099;
const API_KEY = process.env.WA_API_KEY || 'tulkas-wa-2026';

// Multer para archivos temporales
const upload = multer({
  dest: path.join(process.cwd(), 'tmp'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB máx
});

app.use(cors());
app.use(express.json());

// ── AUTENTICACIÓN SIMPLE ──
const auth = (req, res, next) => {
  const key = req.headers['x-api-key'] || req.query.key;
  if (key !== API_KEY) return res.status(401).json({ error: 'API key inválida' });
  next();
};

// ── SINGLETON DEL SENDER ──
let sender = null;
let senderStatus = 'disconnected'; // disconnected | connecting | qr_pending | ready
let qrBase64 = null;

async function initSender() {
  if (sender && senderStatus === 'ready') return sender;

  senderStatus = 'connecting';
  sender = new WhatsAppSender({
    headless: process.env.HEADLESS !== 'false',
    onQR: (qrData) => {
      senderStatus = 'qr_pending';
      qrBase64 = qrData;
      console.log('[Server] QR disponible en GET /qr');
    },
    onReady: () => {
      senderStatus = 'ready';
      qrBase64 = null;
      console.log('[Server] ✅ WhatsApp listo para enviar');
    },
  });

  await sender.init();
  sender.waitForLogin().catch(err => {
    console.error('[Server] Error en login:', err.message);
    senderStatus = 'disconnected';
  });

  return sender;
}

// Iniciar al arrancar el servidor
initSender();

// ── RUTAS ──

// GET /status — estado de la conexión
app.get('/status', auth, async (req, res) => {
  const status = await sender?.getStatus() ?? { connected: false, loggedIn: false };
  res.json({ status: senderStatus, ...status });
});

// GET /qr — QR para escanear (cuando senderStatus === 'qr_pending')
app.get('/qr', auth, (req, res) => {
  if (senderStatus !== 'qr_pending' || !qrBase64) {
    return res.json({ status: senderStatus, message: 'QR no disponible. Estado: ' + senderStatus });
  }
  // Devolver como imagen SVG con QR embebido
  res.json({ status: 'qr_pending', qr: qrBase64 });
});

// POST /send/message — enviar texto
app.post('/send/message', auth, async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) return res.status(400).json({ error: 'phone y message son requeridos' });
  if (senderStatus !== 'ready') return res.status(503).json({ error: 'WhatsApp no está listo. Estado: ' + senderStatus });

  try {
    const result = await sender.sendMessage(phone, message);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /send/file — enviar archivo (multipart)
app.post('/send/file', auth, upload.single('file'), async (req, res) => {
  const { phone, caption } = req.body;
  if (!phone || !req.file) return res.status(400).json({ error: 'phone y file son requeridos' });
  if (senderStatus !== 'ready') return res.status(503).json({ error: 'WhatsApp no está listo. Estado: ' + senderStatus });

  try {
    const result = await sender.sendFile(phone, req.file.path, caption || '');
    fs.unlinkSync(req.file.path); // limpiar tmp
    res.json({ success: true, ...result });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// POST /send/oc — enviar Orden de Compra (PDF)
// Acepta el PDF como base64 en el body (para llamadas desde apps Vercel/Node sin multipart)
app.post('/send/oc', auth, async (req, res) => {
  const { phone, pdfBase64, nombreProveedor, nroOC, caption } = req.body;
  if (!phone || !pdfBase64 || !nroOC) {
    return res.status(400).json({ error: 'phone, pdfBase64 y nroOC son requeridos' });
  }
  if (senderStatus !== 'ready') {
    return res.status(503).json({ error: 'WhatsApp no está listo. Estado: ' + senderStatus });
  }

  // Guardar PDF temporal
  const tmpPath = path.join(process.cwd(), 'tmp', `OC_${nroOC}_${Date.now()}.pdf`);
  fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
  fs.writeFileSync(tmpPath, Buffer.from(pdfBase64, 'base64'));

  try {
    const result = await sender.sendOrdenCompra(phone, tmpPath, nombreProveedor || 'Proveedor', nroOC);
    fs.unlinkSync(tmpPath);
    res.json({ success: true, ...result });
  } catch (err) {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    res.status(500).json({ error: err.message });
  }
});

// POST /reconnect — reconectar si se desconectó
app.post('/reconnect', auth, async (req, res) => {
  try {
    await sender?.close();
    senderStatus = 'disconnected';
    qrBase64 = null;
    await initSender();
    res.json({ success: true, message: 'Reconectando...' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[WA Sender Server] Corriendo en puerto ${PORT}`);
  console.log(`[WA Sender Server] API Key: ${API_KEY}`);
});

module.exports = app;
