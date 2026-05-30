# @federico/images

Browser-only. Dos utilidades:

- `validateArtwork(file, slot, opts?)` — valida tipo, peso, ratio y resolución.
  Slots por defecto H/V/Sq, parametrizables vía `opts.rules`.
- `generateMockup(photoSrc, zone, artworkSrc, opts?)` — inserta una imagen en
  perspectiva dentro de una zona cuadrilátera usando canvas.

```js
import { validateArtwork, generateMockup } from '@federico/images'
```
