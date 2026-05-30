/**
 * @federico/utils — datetime
 *
 * Helpers de fecha/hora con timezone. Copiado de comunas-app/src/lib/datetime.js.
 * La DB guarda timestamptz (UTC); la UI muestra en hora local (default
 * Argentina UTC-3). La TZ es parametrizable por si un proyecto la necesita
 * distinta, pero el default replica el comportamiento original de comunas.
 *
 * Pieza valiosa: longDateOf() resuelve el bug clásico de que un YYYY-MM-DD
 * plano (de un <input type=date>) se corra al día anterior al convertir TZ —
 * lo ancla a mediodía para evitarlo.
 */

export const ARG_TZ = 'America/Argentina/Buenos_Aires';
export const ARG_OFFSET = '-03:00';

function makeFormatters(tz) {
  return {
    time: new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
    }),
    date: new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    }),
    shortDate: new Intl.DateTimeFormat('es-AR', {
      timeZone: tz, day: '2-digit', month: 'short',
    }),
    longDate: new Intl.DateTimeFormat('es-AR', {
      timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }),
  };
}

// Formatters default (Argentina). Si se pasa otra TZ a las funciones, se
// crean formatters ad-hoc.
const _def = makeFormatters(ARG_TZ);

function fmtFor(tz) {
  return tz && tz !== ARG_TZ ? makeFormatters(tz) : _def;
}

/** "HH:MM" en la TZ dada (default Argentina). */
export function timeOf(iso, tz) {
  if (!iso) return '';
  const d = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d)) return '';
  return fmtFor(tz).time.format(d);
}

/** "YYYY-MM-DD" en la TZ dada. */
export function dateOf(iso, tz) {
  if (!iso) return '';
  const d = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d)) return '';
  return fmtFor(tz).date.format(d);
}

/** "YYYY-MM-DD · HH:MM" en la TZ dada. */
export function dateTimeOf(iso, tz) {
  if (!iso) return '—';
  const d = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d)) return String(iso);
  const f = fmtFor(tz);
  return `${f.date.format(d)} · ${f.time.format(d)}`;
}

/** "DD MMM" en la TZ dada (headers de calendario). */
export function shortDateOf(iso, tz) {
  if (!iso) return '';
  const d = iso instanceof Date ? iso : new Date(iso);
  if (isNaN(d)) return '';
  return fmtFor(tz).shortDate.format(d);
}

/** Hoy como "YYYY-MM-DD" en la TZ dada. */
export function todayYMD(tz) {
  return fmtFor(tz).date.format(new Date());
}

/**
 * "miércoles 12 de mayo de 2026" — fecha larga en español para documentos.
 * Un YYYY-MM-DD plano se ancla a mediodía para que la conversión TZ no lo
 * corra al día anterior. Las ISO con hora/zona se formatean tal cual.
 */
export function longDateOf(input, tz) {
  if (!input) return '';
  const f = fmtFor(tz);
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split('-').map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    return f.longDate.format(date);
  }
  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date)) return '';
  return f.longDate.format(date);
}
