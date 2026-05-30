# @federico/supabase

Factory de cliente Supabase + `fetchAllPaginated` (sortea el límite de 1000
filas de PostgREST). Requiere `@supabase/supabase-js` como peer dependency.

```js
import { createSupabaseClient, fetchAllPaginated } from '@federico/supabase'

const supabase = createSupabaseClient({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY,
})

const rows = await fetchAllPaginated(({ from, to }) =>
  supabase.from('mi_tabla').select('*').range(from, to)
)
```
