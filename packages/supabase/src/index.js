/**
 * @federico/supabase
 *
 * Factory de cliente Supabase + helpers de datos.
 * Extraído de oohplanner-app/src/lib/supabase.js, generalizado para inyectar
 * url/key (en vez de leer import.meta.env directo) y así servir a cualquier
 * proyecto del ecosistema.
 *
 * Incluye fetchAllPaginated: PostgREST limita a 1000 filas por query sin
 * paginación explícita. Decisión técnica crítica documentada en CUREX
 * (queries de clicks/conversiones) y aplicable a cualquier tabla grande.
 *
 * Requiere @supabase/supabase-js como peer dependency.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Crea un cliente Supabase con la config de auth estándar del ecosistema.
 *
 * @param {object} cfg
 * @param {string} cfg.url   SUPABASE_URL / VITE_SUPABASE_URL
 * @param {string} cfg.key   anon key (o service role para backend)
 * @param {object} [cfg.options] overrides para createClient
 * @returns cliente Supabase
 */
export function createSupabaseClient({ url, key, options = {}, storageKey } = {}) {
  if (!url || !key) {
    throw new Error('createSupabaseClient: url y key son requeridos');
  }
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // storageKey namespaceado evita colisiones si el mismo origen monta
      // otro cliente Supabase (patrón tomado de comunas-app: 'comunas-auth').
      ...(storageKey ? { storageKey } : {}),
    },
    ...options,
  });
}

/**
 * Cliente Supabase PÚBLICO — sin auth ni persistencia. Para lecturas anónimas
 * (portales públicos, landing, etc.).
 *
 * Por qué existe (lección de comunas-app): el cliente principal persiste
 * sesión y, aun con lock deshabilitado, supabase-js v2 chequea sesión en cada
 * query. Al montar un portal que dispara muchas queries anónimas en paralelo,
 * el lock interno se peleaba ("Lock was released because another request stole
 * it") y algunas queries fallaban intermitentemente. Este cliente lo resuelve
 * por construcción: persistSession/autoRefreshToken/detectSessionInUrl en false
 * → GoTrueClient queda inerte, las queries van directo al REST con la anon key.
 * Al no compartir storageKey con el principal, tampoco dispara el warning
 * "Multiple GoTrueClient instances detected".
 *
 * REGLA: el cliente principal solo para flujos autenticados (admin, auth
 * context); el público para todo lo que sea lectura sin sesión.
 *
 * @param {object} cfg { url, key, options? }
 */
export function createPublicSupabaseClient({ url, key, options = {} } = {}) {
  if (!url || !key) {
    throw new Error('createPublicSupabaseClient: url y key son requeridos');
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: { 'x-client-info': 'frey-public' },
    },
    ...options,
  });
}

const DEFAULT_PAGE_SIZE = 1000;

/**
 * Trae TODAS las filas de una query paginando en bloques, sorteando el
 * límite de 1000 filas de PostgREST.
 *
 * El callback recibe el rango [from, to] y debe devolver una promesa
 * { data, error } — típicamente una query de Supabase con .range(from, to).
 *
 * @example
 *   const rows = await fetchAllPaginated(({ from, to }) =>
 *     supabase
 *       .from('curex_adv_clicks')
 *       .select('*')
 *       .eq('cli_id', cliId)
 *       .range(from, to)
 *   );
 *
 * @param {(range: {from:number,to:number}) => Promise<{data:any[],error:any}>} queryFn
 * @param {object} [opts]
 * @param {number} [opts.pageSize=1000]
 * @param {number} [opts.maxRows=Infinity] tope de seguridad
 * @returns {Promise<any[]>}
 */
export async function fetchAllPaginated(queryFn, opts = {}) {
  const { pageSize = DEFAULT_PAGE_SIZE, maxRows = Infinity } = opts;
  const all = [];
  let from = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await queryFn({ from, to });
    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...data);

    if (data.length < pageSize) break; // última página
    if (all.length >= maxRows) {
      return all.slice(0, maxRows);
    }
    from += pageSize;
  }

  return all;
}

export { createClient };
