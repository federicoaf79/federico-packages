/**
 * @federico/whatsapp-web-sender
 * Módulo reutilizable del ecosistema Tulkas
 * Envía mensajes y archivos por WhatsApp Web via Puppeteer
 *
 * Uso básico:
 *   const sender = new WhatsAppSender();
 *   await sender.init();           // abre el browser
 *   await sender.waitForLogin();   // espera el QR scan
 *   await sender.sendMessage('5491112345678', 'Hola!');
 *   await sender.sendFile('5491112345678', '/ruta/archivo.pdf', 'Orden de compra adjunta');
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const WHATSAPP_WEB_URL = 'https://web.whatsapp.com';
const SESSION_FILE = path.join(process.cwd(), '.wwa_session');

class WhatsAppSender {
  constructor(options = {}) {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
    this.headless = options.headless ?? false; // false para ver el QR en el browser
    this.sessionFile = options.sessionFile ?? SESSION_FILE;
    this.timeout = options.timeout ?? 60000;
    this.onQR = options.onQR ?? null; // callback cuando aparece el QR
    this.onReady = options.onReady ?? null; // callback cuando está listo
  }

  // ── INICIALIZAR BROWSER ──
  async init() {
    console.log('[WA Sender] Iniciando browser...');

    // Cargar sesión previa si existe
    const userDataDir = path.join(process.cwd(), '.wwa_profile');

    this.browser = await puppeteer.launch({
      headless: this.headless,
      userDataDir, // persiste la sesión entre reinicios
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
      defaultViewport: { width: 1280, height: 800 },
    });

    this.page = await this.browser.newPage();
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await this.page.goto(WHATSAPP_WEB_URL, { waitUntil: 'networkidle2' });
    console.log('[WA Sender] Browser listo. Verificando sesión...');
    return this;
  }

  // ── ESPERAR LOGIN (QR o sesión previa) ──
  async waitForLogin() {
    console.log('[WA Sender] Esperando login...');

    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando login. Verificá el QR.'));
      }, this.timeout);

      // Verificar si ya hay sesión activa
      try {
        await this.page.waitForSelector('[data-testid="chat-list"]', { timeout: 5000 });
        clearTimeout(timeout);
        this.isLoggedIn = true;
        console.log('[WA Sender] ✅ Sesión activa encontrada. Listo sin QR.');
        if (this.onReady) this.onReady();
        resolve(true);
        return;
      } catch (_) {
        // No hay sesión activa, esperar QR
      }

      // Esperar QR
      console.log('[WA Sender] No hay sesión previa. Esperando QR...');
      if (this.onQR) {
        try {
          await this.page.waitForSelector('[data-ref]', { timeout: 15000 });
          const qrData = await this.page.$eval('[data-ref]', el => el.getAttribute('data-ref'));
          this.onQR(qrData);
        } catch (_) {}
      }

      // Esperar hasta que aparezca la lista de chats (login completo)
      try {
        await this.page.waitForSelector('[data-testid="chat-list"]', {
          timeout: this.timeout,
        });
        clearTimeout(timeout);
        this.isLoggedIn = true;
        console.log('[WA Sender] ✅ Login completado.');
        if (this.onReady) this.onReady();
        resolve(true);
      } catch (err) {
        clearTimeout(timeout);
        reject(new Error('Login fallido o timeout. ' + err.message));
      }
    });
  }

  // ── ENVIAR MENSAJE DE TEXTO ──
  async sendMessage(phone, message) {
    if (!this.isLoggedIn) throw new Error('No estás logueado. Llamá a waitForLogin() primero.');

    const cleanPhone = this._cleanPhone(phone);
    console.log(`[WA Sender] Enviando mensaje a ${cleanPhone}...`);

    // Navegar al chat directo por URL (más confiable que buscar en la lista)
    await this.page.goto(`${WHATSAPP_WEB_URL}/send?phone=${cleanPhone}`, {
      waitUntil: 'networkidle2',
    });

    // Esperar el input del mensaje
    await this.page.waitForSelector('[data-testid="conversation-compose-box-input"]', {
      timeout: 15000,
    });

    // Escribir el mensaje
    const inputBox = await this.page.$('[data-testid="conversation-compose-box-input"]');
    await inputBox.click();
    await this.page.keyboard.type(message, { delay: 30 });

    // Enviar con Enter
    await this.page.keyboard.press('Enter');
    await this._sleep(1500);

    console.log(`[WA Sender] ✅ Mensaje enviado a ${cleanPhone}`);
    return { success: true, phone: cleanPhone, type: 'text' };
  }

  // ── ENVIAR ARCHIVO (PDF, imagen, etc.) ──
  async sendFile(phone, filePath, caption = '') {
    if (!this.isLoggedIn) throw new Error('No estás logueado. Llamá a waitForLogin() primero.');
    if (!fs.existsSync(filePath)) throw new Error(`Archivo no encontrado: ${filePath}`);

    const cleanPhone = this._cleanPhone(phone);
    const fileName = path.basename(filePath);
    console.log(`[WA Sender] Enviando archivo ${fileName} a ${cleanPhone}...`);

    // Navegar al chat
    await this.page.goto(`${WHATSAPP_WEB_URL}/send?phone=${cleanPhone}`, {
      waitUntil: 'networkidle2',
    });
    await this.page.waitForSelector('[data-testid="conversation-compose-box-input"]', {
      timeout: 15000,
    });

    // Click en el botón de adjuntar
    const attachBtn = await this.page.$('[data-testid="attach-menu-icon"]') ||
                      await this.page.$('[title="Adjuntar"]') ||
                      await this.page.$('span[data-icon="attach-menu-plus"]');

    if (!attachBtn) throw new Error('No se encontró el botón de adjuntar. Verificá que WhatsApp Web esté actualizado.');

    await attachBtn.click();
    await this._sleep(800);

    // Buscar el input de archivo (tipo document)
    const fileInput = await this.page.$('input[type="file"]');
    if (!fileInput) throw new Error('No se encontró el input de archivo.');

    await fileInput.uploadFile(filePath);
    await this._sleep(2000);

    // Agregar caption si existe
    if (caption) {
      try {
        const captionBox = await this.page.$('[data-testid="media-caption-input"]');
        if (captionBox) {
          await captionBox.click();
          await this.page.keyboard.type(caption, { delay: 20 });
        }
      } catch (_) {}
    }

    // Enviar
    const sendBtn = await this.page.$('[data-testid="send"]') ||
                    await this.page.$('span[data-icon="send"]');
    if (sendBtn) {
      await sendBtn.click();
    } else {
      await this.page.keyboard.press('Enter');
    }

    await this._sleep(2000);
    console.log(`[WA Sender] ✅ Archivo ${fileName} enviado a ${cleanPhone}`);
    return { success: true, phone: cleanPhone, type: 'file', fileName };
  }

  // ── ENVIAR OC (PDF + mensaje) — helper específico para Dentalab/OOH/etc ──
  async sendOrdenCompra(phone, pdfPath, nombreProveedor, nroOC) {
    const caption = `Orden de compra N° ${nroOC}\nPor favor confirmar recepción.`;
    const mensaje = `Hola ${nombreProveedor}! Te adjunto la OC N° ${nroOC}. Quedamos a disposición para cualquier consulta.`;

    // Primero el archivo con caption
    await this.sendFile(phone, pdfPath, caption);
    await this._sleep(1000);

    return { success: true, nroOC, phone };
  }

  // ── VERIFICAR ESTADO ──
  async getStatus() {
    if (!this.browser || !this.page) return { connected: false, loggedIn: false };
    try {
      const hasChat = await this.page.$('[data-testid="chat-list"]');
      return { connected: true, loggedIn: !!hasChat };
    } catch (_) {
      return { connected: false, loggedIn: false };
    }
  }

  // ── CERRAR ──
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isLoggedIn = false;
      console.log('[WA Sender] Browser cerrado.');
    }
  }

  // ── HELPERS ──
  _cleanPhone(phone) {
    // Acepta: +5491112345678, 5491112345678, 1112345678 (agrega 54)
    let clean = phone.toString().replace(/[\s\-\+\(\)]/g, '');
    if (!clean.startsWith('54') && clean.length <= 10) clean = '54' + clean;
    return clean;
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { WhatsAppSender };
