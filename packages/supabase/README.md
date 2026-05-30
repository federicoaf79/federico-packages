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

## Cliente público (lecturas anónimas)

Para portales públicos / landings que disparan muchas queries anónimas en
paralelo. Evita el conflicto de locks de auth de supabase-js (lección de comunas).

```js
import { createPublicSupabaseClient } from '@federico/supabase'

const supabasePublic = createPublicSupabaseClient({ url, key })
// sin persistSession ni auth lock — queries directas al REST con anon key
```

El cliente principal acepta `storageKey` para namespacear la sesión y evitar
colisiones si conviven dos clientes en el mismo origen.
