# @federico/email

Envío de emails vía Supabase Edge Function (Resend). Recibe el cliente Supabase
por parámetro; el nombre de la función es configurable (default `send-email`).

```js
import { createEmailer } from '@federico/email'

const email = createEmailer(supabase) // o (supabase, { functionName: 'mi-fn' })
await email.send({ to: 'x@y.com', subject: 'Hola', html: '<b>Hi</b>' })
```
