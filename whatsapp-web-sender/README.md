# @federico/whatsapp-web-sender

Módulo reutilizable del ecosistema Tulkas. Envía mensajes y archivos por WhatsApp Web via Puppeteer sin necesidad de la API oficial de Meta.

## Para qué sirve

- Enviar **Órdenes de Compra en PDF** a proveedores (Dentalab-Compras, OOH Planner)
- Enviar **notificaciones a vecinos** sin costo de SMS Twilio (Comunas)
- Enviar **propuestas comerciales** a clientes (OOH Planner)
- Alternativa sin costo mensual a Plan-B para clientes de baja escala

## Cómo funciona

1. El servidor arranca y abre WhatsApp Web en un browser Chromium (Puppeteer)
2. Si no hay sesión previa, muestra el QR para escanear con el teléfono de la empresa
3. Una vez escaneado, la sesión persiste — no hay que volver a escanear
4. Cualquier app del ecosistema le hace requests HTTP para enviar mensajes/archivos

## Setup inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tu API key
```

### 3. Primer arranque — escanear QR
```bash
# Con HEADLESS=false en .env para ver el browser
npm start
```

Se abre un browser con WhatsApp Web. Escaneá el QR con el teléfono de la empresa.
La sesión queda guardada en `.wwa_profile/` — no hay que volver a escanear.

### 4. Deploy en Railway (producción)
```bash
# Con HEADLESS=true en .env
# El QR se obtiene via GET /qr y se muestra en TulkasOS
```

## API REST

Todas las rutas requieren el header `x-api-key: TU_API_KEY`

### GET /status
Estado de la conexión.
```json
{ "status": "ready", "connected": true, "loggedIn": true }
```

### GET /qr
QR para escanear (solo cuando status es `qr_pending`).
```json
{ "status": "qr_pending", "qr": "base64..." }
```

### POST /send/message
Enviar texto.
```json
{ "phone": "5491112345678", "message": "Hola!" }
```

### POST /send/oc
Enviar Orden de Compra (PDF en base64).
```json
{
  "phone": "5491112345678",
  "pdfBase64": "JVBERi0xLjQ...",
  "nroOC": "OC-2026-001",
  "nombreProveedor": "Distribuidora Dental SA"
}
```

### POST /send/file
Enviar archivo genérico (multipart/form-data).
```
phone: 5491112345678
caption: Archivo adjunto
file: [archivo]
```

### POST /reconnect
Reconectar si se cayó la sesión.

## Integración en una app del ecosistema

```javascript
// En el proyecto Dentalab, OOH, Comunas, etc.
// Copiar src/client.js como src/lib/whatsappClient.js

import { sendOC } from './lib/whatsappClient';

// Al aprobar una OC
await sendOC({
  phone: proveedor.whatsapp,
  pdfBase64: ocPdfBase64,
  nroOC: oc.numero,
  nombreProveedor: proveedor.nombre
});
```

## Variables de entorno en la app consumidora

```bash
# URL del servidor de WhatsApp Sender
WA_SENDER_URL=http://localhost:3099  # desarrollo
WA_SENDER_URL=https://wa-sender.railway.app  # producción

# Misma key que configuraste en el servidor
WA_API_KEY=tulkas-wa-2026
```

## Limitaciones

- El teléfono vinculado debe estar con internet y con WhatsApp activo
- WhatsApp puede desloguear la sesión si el teléfono se reinicia o cambia de red
- No es para envíos masivos (>100 mensajes/hora puede gatillar bloqueos de WA)
- Para envíos masivos o sin teléfono vinculado: usar Plan-B con API oficial de Meta

## Estructura del módulo

```
whatsapp-web-sender/
  src/
    index.js      ← clase WhatsAppSender (core)
    server.js     ← servidor Express con API REST
    client.js     ← cliente para consumir desde otras apps
  .env.example
  package.json
  README.md
```

## Deploy en Railway

1. Crear nuevo proyecto en Railway desde este repo
2. Agregar variables de entorno: `PORT`, `WA_API_KEY`, `HEADLESS=true`
3. Al primer deploy, obtener el QR via `GET /qr` con la URL de Railway
4. Escanear con el teléfono de la empresa
5. Listo — la sesión persiste entre deploys gracias al volumen de Railway
