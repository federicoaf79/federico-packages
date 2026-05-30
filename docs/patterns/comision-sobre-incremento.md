# Patrón: Comisión sobre incremento (markup invisible)

**Origen:** CUREX
**Estado:** producción

## Problema

Monetizar sin cobrar un fee fijo ni un porcentaje visible: el negocio cobra sobre
el **resultado que genera**, de forma que el cliente no ve una "comisión" como
línea separada.

## Idea central

Dos lados del marketplace, dos lógicas:

- **Publisher:** se queda el 25% **sobre el incremento de CPM** que CUREX logra
  (no sobre el CPM total). Si el CPM sube de $2.50 a $4.00, la comisión es sobre
  los $1.50 de delta, no sobre los $4.00.
- **Advertiser:** markup invisible del 7-13% incorporado en el precio, no
  desglosado.

La clave: la comisión se calcula sobre un **delta** (mejora vs. baseline), no
sobre el monto bruto. Esto alinea el incentivo (solo gana si mejora el resultado)
y mantiene el pricing limpio de cara al cliente.

## Cómo reusarlo

Sirve para cualquier negocio que quiera cobrar "sobre el valor agregado": hay que
definir un **baseline medible** (CPM sin curar, en este caso) y comisionar sobre
la diferencia. El reto siempre es justificar el baseline de forma transparente.

## No reusar tal cual

Los rangos (25%, 7-13%) y la noción de CPM/inventario IAB-safe (CUREX WHITE) vs.
gambling/alcohol/crypto (CUREX GREY) son dominio del negocio publicitario de CUREX.
