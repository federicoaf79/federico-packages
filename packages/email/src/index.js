/**
 * @federico/email
 *
 * Envío de emails a través de una Supabase Edge Function que internamente
 * usa Resend. Extraído de oohplanner-app/src/lib/email.js, generalizado para
 * recibir el cliente Supabase por parámetro y permitir configurar el nombre
 * de la Edge Function (default 'send-email').
 *
 * No tiene dependencias propias: usa el cliente Supabase que le inyecta el
 * proyecto consumidor.
 */

/**
 * Crea un emailer ligado a un cliente Supabase.
 *
 * @example
 *   import { createSupabaseClient } from '@federico/supabase'
 *   import { createEmailer } from '@federico/email'
 *   const supabase = createSupabaseClient({ url, key })
 *   const email = createEmailer(supabase)
 *   await email.send({ to: 'x@y.com', subject: 'Hola', html: '<b>Hi</b>' })
 *
 * @param {object} supabase  cliente de @supabase/supabase-js
 * @param {object} [opts]
 * @param {string} [opts.functionName='send-email']  nombre de la Edge Function
 */
export function createEmailer(supabase, opts = {}) {
  const { functionName = 'send-email' } = opts;
  if (!supabase || typeof supabase.functions?.invoke !== 'function') {
    throw new Error('createEmailer: se requiere un cliente Supabase válido');
  }

  return {
    /**
     * Envía un email.
     * @param {{ to: string|string[], subject: string, html: string, text?: string, from?: string }} params
     * @returns {Promise<{ data: any, error: any }>}
     */
    async send({ to, subject, html, text, from } = {}) {
      if (!to) return { data: null, error: new Error('send: "to" es requerido') };
      if (!subject) return { data: null, error: new Error('send: "subject" es requerido') };
      if (!html && !text) {
        return { data: null, error: new Error('send: se requiere "html" o "text"') };
      }
      return supabase.functions.invoke(functionName, {
        body: { to, subject, html, text, from },
      });
    },
  };
}

/**
 * Versión funcional directa (sin crear emailer), por compatibilidad con el
 * patrón original de oohplanner. Recibe el cliente como primer argumento.
 *
 * @param {object} supabase
 * @param {{ to, subject, html, text?, from? }} params
 * @param {object} [opts] { functionName }
 */
export async function sendEmail(supabase, params, opts = {}) {
  return createEmailer(supabase, opts).send(params);
}
