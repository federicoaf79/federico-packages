# Patrón: Rentabilidad con producción pass-through y markup granular

**Origen:** OOH Planner — `src/lib/profitability.js` (modelo V2, 2026-04-25)
**Estado:** producción

## Problema

Calcular el margen real de una operación donde el negocio:
- alquila un espacio (revenue principal),
- **compra producción a proveedores y la revende con markup** (impresión,
  colocación, diseño),
- tiene costos estructurales prorrateables (alquiler, luz, impuestos,
  mantenimiento),
- paga comisiones que NO deben verse afectadas por el markup de producción.

## Idea central

Separar tres capas y no mezclarlas:

1. **Alquiler (espacio):** `revenue_gross = rate × months`, luego
   `alquiler_net = revenue_gross × (1 − discount%)`. Las comisiones se calculan
   **solo** sobre `alquiler_net`.

2. **Producción pass-through:** se modela con tres valores por componente:
   - `real` — lo que el negocio paga al proveedor (costo)
   - `standard` — lo cobrado al cliente con el markup configurado a nivel org
   - `efectiva` — el standard ajustado por bonificaciones/descuentos por ítem
   El profit de producción es `efectiva − real`. Se factura one-time al inicio.

3. **Costos estructurales:** prorrateados por meses de duración.

```
revenue_total = alquiler_net + produccion_cobrada_efectiva
cost_total    = fixed_prorated + produccion_costo_real
              + seller_comm + agency_comm + owner_comm
margin        = revenue_total − cost_total
```

## Decisiones de diseño que valen oro

- **Backwards compat por presencia de config:** si la org no tiene la config V2,
  el mismo código cae al modelo V1 (producción como costo interno, sin cobro al
  cliente). Detecta la versión chequeando si existe alguna columna nueva.
- **Funciones puras:** el cálculo per-site no lee de la DB; recibe todo por
  parámetros. Esto lo hace testeable y reusable desde múltiples pantallas.
- **Prorrateo mensual real:** `monthsByCalendar` respeta los días reales de cada
  mes (feb 28/29, etc.) en vez de asumir 30 días.
- **Aliases de backwards-compat** en el output (`revenue_net`, `costs`) para no
  romper consumidores viejos al evolucionar el shape.
- **Espejo en Edge Function:** la misma fórmula existe en Deno
  (`plan-pauta/index.ts::calcMargin`) porque Deno no puede importar desde
  `src/lib`. Si cambia una, cambiar la otra. (Este es el costo de no tener la
  fórmula como package — pero ver nota abajo.)

## Cómo reusarlo en un proyecto nuevo

El esqueleto de tres capas (revenue principal / pass-through con markup / costos
prorrateados) y el patrón "función pura que recibe toda la config por params"
sirven para cualquier negocio de reventa con servicios agregados (agencias,
productoras, integradores). La técnica de `monthsByCalendar` es genérica y
**candidata a subir a `@federico/utils`** si un segundo proyecto la necesita.

## No reusar tal cual

Toda la nomenclatura (`alquiler_net`, `produccion_*`, `cost_owner_commission`) y
las columnas `cost_*` del inventario son dominio OOH.
