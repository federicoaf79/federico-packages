# @federico/utils

Utilidades genéricas: `cn` (clases Tailwind), `formatCurrency` (locale/moneda
parametrizable), `formatDate`, `getInitials`.

```js
import { cn, formatCurrency, formatDate, getInitials } from '@federico/utils'

formatCurrency(1234567)                                   // "$ 1.234.567"
formatCurrency(1234.5, { locale:'en-US', symbol:'US$ ', decimals:2 }) // "US$ 1,234.50"
```

Para resolución de conflictos de Tailwind en `cn`, instalar `clsx` +
`tailwind-merge` y llamar `await initCn()` una vez al inicio. Sin eso, `cn` usa
un fallback simple.
