# Patrón: Paginación de PostgREST (>1000 filas)

**Origen:** CUREX — queries de clicks/conversiones
**Estado:** producción · decisión técnica crítica
**Ahora también:** implementado como código en `@federico/supabase` → `fetchAllPaginated`

## Problema

PostgREST (la capa REST de Supabase) **limita a 1000 filas por query** aunque no
pongas `.limit()`. Una query de `curex_adv_clicks` con 8.000+ registros devuelve
solo las primeras 1000 silenciosamente — datos incompletos sin error.

## Idea central

Paginar con `.range(from, to)` en bloques de 1000 hasta que una página vuelva con
menos filas que el tamaño de página (señal de última página).

```js
import { fetchAllPaginated } from '@federico/supabase'

const rows = await fetchAllPaginated(({ from, to }) =>
  supabase.from('curex_adv_clicks').select('*').eq('cli_id', id).range(from, to)
)
```

## Reglas que lo acompañan

- SIEMPRE paginar en queries de tablas que crecen (clicks, eventos, logs, métricas).
- NO cachear en memoria resultados que cambian (en CUREX, `statsMem` causaba datos
  stale en el AdvertiserDashboard).

## Estado

Este patrón ya está productizado: usar el package, no reimplementar.
