/**
 * @federico/utils
 *
 * Utilidades genéricas reutilizables en cualquier proyecto del ecosistema.
 * Extraído de oohplanner-app/src/lib/utils.js — generalizado para no
 * hardcodear locale ni moneda.
 */

/**
 * Combina clases de Tailwind resolviendo conflictos.
 * Si el proyecto consumidor tiene clsx + tailwind-merge instalados, los usa
 * (resolución lazy, una sola vez). Si no, cae a un fallback sin dependencias.
 *
 * Para activar la resolución de conflictos de Tailwind, llamar una vez al
 * inicio del proyecto: `await initCn()`. Si no se llama, cn() funciona igual
 * con el fallback simple (suficiente para la mayoría de los casos).
 */
let _twMerge = null;
let _clsx = null;
let _cnReady = false;

export async function initCn() {
  if (_cnReady) return;
  try {
    _clsx = (await import('clsx')).clsx;
    _twMerge = (await import('tailwind-merge')).twMerge;
  } catch {
    // sin Tailwind — fallback simple
  }
  _cnReady = true;
}

export function cn(...inputs) {
  if (_twMerge && _clsx) return _twMerge(_clsx(inputs));
  // Fallback sin dependencias: aplana, filtra falsy y une.
  return inputs.flat(Infinity).filter(Boolean).join(' ');
}

/**
 * Formatea un número como moneda.
 * El locale y la moneda son parametrizables — por defecto es-AR / ARS
 * con prefijo "$ " manual para evitar que browsers con datos de locale
 * incompletos produzcan "US$" o "ARS".
 *
 * @param {number} amount
 * @param {object} [opts]
 * @param {string} [opts.locale='es-AR']
 * @param {string} [opts.symbol='$ ']  prefijo de moneda
 * @param {number} [opts.decimals=0]
 * @param {string} [opts.empty='—']    valor a mostrar si amount es null/NaN
 */
export function formatCurrency(amount, opts = {}) {
  const { locale = 'es-AR', symbol = '$ ', decimals = 0, empty = '—' } = opts;
  if (amount == null) return empty;
  const n = Number(amount);
  if (Number.isNaN(n)) return empty;
  const fmt = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const value = decimals === 0 ? Math.round(n) : n;
  return `${symbol}${fmt.format(value)}`;
}

/**
 * Formatea una fecha (string o Date) de forma legible.
 *
 * @param {string|Date} dateInput
 * @param {object} [opts]
 * @param {string} [opts.locale='es-AR']
 * @param {Intl.DateTimeFormatOptions} [opts.format] override de formato
 * @param {string} [opts.empty='—']
 */
export function formatDate(dateInput, opts = {}) {
  const {
    locale = 'es-AR',
    format = { day: '2-digit', month: 'short', year: 'numeric' },
    empty = '—',
  } = opts;
  if (!dateInput) return empty;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return empty;
  return new Intl.DateTimeFormat(locale, format).format(d);
}

/**
 * Iniciales de un nombre (hasta 2 letras, mayúsculas).
 * @param {string} name
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
