/**
 * @federico/images
 *
 * Punto de entrada del package. Re-exporta:
 *   - validateArtwork (+ DEFAULT_SLOT_RULES)
 *   - generateMockup
 *
 * Ambos son browser-only (usan Image / canvas).
 */

export { validateArtwork, DEFAULT_SLOT_RULES } from './validateArtwork.js';
export { generateMockup } from './generateMockup.js';
