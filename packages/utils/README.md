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

## datetime (TZ Argentina por defecto)

```js
import { longDateOf, dateTimeOf, todayYMD } from '@federico/utils/datetime'

dateTimeOf('2026-05-29T15:30:00Z')  // "2026-05-29 · 12:30" (UTC-3)
longDateOf('2026-05-12')            // "martes, 12 de mayo de 2026" (sin shift de día)
```

`longDateOf` ancla los YYYY-MM-DD planos a mediodía para que la conversión de
timezone no los corra al día anterior. TZ parametrizable como 2º argumento.
