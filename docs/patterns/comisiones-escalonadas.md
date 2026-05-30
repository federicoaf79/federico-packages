# Patrón: Comisiones escalonadas con facilitadores

**Origen:** OOH Planner — `src/lib/commissions.js`
**Estado:** producción

## Problema

Calcular la comisión de un vendedor cuando el porcentaje **sube por tramos**
según las ventas acumuladas del mes (ej. 5% hasta $1M, 8% de $1M a $3M, 10% en
adelante), y además repartir comisiones a "facilitadores" — algunos de los
cuales deben quedar **ocultos** en cualquier export al cliente.

## Idea central

1. **Base de cálculo inmutable:** la comisión SIEMPRE se calcula sobre el precio
   de venta de cada ítem individual, nunca sobre el total de la campaña ni sobre
   la tarifa bruta:

   ```
   precio_venta = rate × months × (1 − discount%/100)
   comisión     = precio_venta × pct/100
   ```

2. **Tramos progresivos:** se recorre el monto nuevo "llenando" cada tramo desde
   la acumulación previa del mes. Cada porción del monto se comisiona al pct del
   tramo donde cae. Si una propuesta tiene varios ítems, se acumula
   progresivamente entre ítems.

3. **Fallback plano:** si no hay tramos configurados, usa un porcentaje único.

4. **Facilitadores ocultos:** los actores con `commission_type` de tipo hidden
   se enmascaran con un nombre genérico ("(Oculto — venta)") y NUNCA se muestran
   en PDFs ni exports para clientes.

## Reglas de negocio que lo acompañan

- Descuento ≠ comisión. El descuento es visible al cliente; la comisión no.
- Las comisiones se auto-generan al aceptar una propuesta — nunca se setean a mano.
- Atribución temporal por fecha de aceptación (`accepted_at`), no por el rango de
  la campaña.

## Cómo reusarlo en un proyecto nuevo

El mecanismo de "llenar tramos progresivamente" sirve para cualquier esquema de
incentivos por volumen (bonus de ventas, fees escalonados, rappels). Reimplementá
la función de tramos con tu propio modelo de datos; no copies las columnas
específicas de OOH (`site_commissions`, `commission_type` con sus enums OOH).

## No reusar tal cual

Los enums de `commission_type` (`hidden_site_facilitator`, `agency_rebate`, etc.)
y la estructura de `proposal_items` con `site` embebido son 100% dominio OOH.
