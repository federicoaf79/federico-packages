/**
 * @federico/images — validateArtwork
 *
 * Valida tipo, peso, ratio y resolución mínima de una imagen contra un set
 * de reglas por "slot". Extraído de oohplanner-app; las reglas de slot ahora
 * son parametrizables (default: H/V/Sq para mockups OOH) para servir a
 * cualquier proyecto que reciba uploads de imágenes.
 *
 * Browser-only (usa Image / URL.createObjectURL).
 */

export const DEFAULT_SLOT_RULES = {
  h: {
    label: 'Horizontal (16:9)',
    targetRatio: 16 / 9,
    minRatio: 1.5,
    maxRatio: 2.0,
    minW: 1600,
    minH: 900,
    example: '1920 × 1080',
  },
  v: {
    label: 'Vertical (9:16)',
    targetRatio: 9 / 16,
    minRatio: 0.45,
    maxRatio: 0.65,
    minW: 900,
    minH: 1600,
    example: '1080 × 1920',
  },
  sq: {
    label: 'Cuadrado (1:1)',
    targetRatio: 1.0,
    minRatio: 0.85,
    maxRatio: 1.15,
    minW: 900,
    minH: 900,
    example: '1080 × 1080',
  },
};

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}
function ratioStr(width, height) {
  const w = Math.round(width);
  const h = Math.round(height);
  if (!w || !h) return `${w}:${h}`;
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}

function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}

/**
 * Valida una imagen para un slot.
 *
 * @param {File} file
 * @param {string} slot  clave dentro de `rules`
 * @param {object} [opts]
 * @param {object} [opts.rules=DEFAULT_SLOT_RULES]
 * @param {number} [opts.maxBytes=5*1024*1024]
 * @param {string[]} [opts.acceptedTypes=['image/jpeg','image/png']]
 * @returns {Promise<{ valid:boolean, error?:string, width?:number, height?:number }>}
 */
export async function validateArtwork(file, slot, opts = {}) {
  const {
    rules = DEFAULT_SLOT_RULES,
    maxBytes = 5 * 1024 * 1024,
    acceptedTypes = ['image/jpeg', 'image/png'],
  } = opts;

  if (!file.type || !acceptedTypes.includes(file.type)) {
    const got = file.type ? file.type.split('/')[1].toUpperCase() : 'desconocido';
    const labels = acceptedTypes.map((t) => t.split('/')[1].toUpperCase()).join(' o ');
    return { valid: false, error: `Formato no soportado: solo ${labels} (actualmente ${got}).` };
  }

  if (file.size > maxBytes) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    const limitMB = (maxBytes / 1024 / 1024).toFixed(0);
    return { valid: false, error: `El archivo supera el límite de ${limitMB} MB (actualmente ${sizeMB} MB).` };
  }

  const r = rules[slot];
  if (!r) return { valid: false, error: 'Slot de imagen no válido.' };

  let dims;
  try {
    dims = await getImageDimensions(file);
  } catch {
    return { valid: false, error: 'No se pudo leer la imagen. Verificá que sea un archivo válido.' };
  }

  const { width, height } = dims;
  const ratio = width / height;

  if (width < r.minW || height < r.minH) {
    return {
      valid: false,
      width,
      height,
      error: `Resolución insuficiente para ${r.label}: mínimo ${r.minW} × ${r.minH} px, recomendado ${r.example} px (actualmente ${width} × ${height} px).`,
    };
  }

  if (ratio < r.minRatio || ratio > r.maxRatio) {
    return {
      valid: false,
      width,
      height,
      error: `Ratio incorrecto para ${r.label}: actualmente ${ratioStr(width, height)} (${width} × ${height} px), recomendado ${r.example} px.`,
    };
  }

  return { valid: true, width, height };
}
