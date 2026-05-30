# Catálogo de patrones — Frey Hub

Esta carpeta documenta la **inteligencia de negocio** construida en cada proyecto
del ecosistema. **No es código que se importa** — es una biblioteca de referencia
para reusar *soluciones* (no archivos) al construir proyectos nuevos.

## Por qué los patrones viven acá y no como packages

Hay dos cosas distintas en un proyecto:

1. **Infraestructura genérica** (cliente de DB, envío de emails, validación de
   imágenes, formato de moneda). Esto SÍ se vuelve package npm porque sirve igual
   a cualquier proyecto → ver `/packages`.

2. **Inteligencia de dominio** (cómo OOH Planner calcula comisiones escalonadas,
   cómo modela rentabilidad pass-through; cómo CUREX cobra sobre el incremento de
   CPM). Esto **NO** se vuelve package: es específico de cada negocio, y meterlo en
   la biblioteca compartida la contaminaría y crearía acoplamientos peligrosos
   (un cambio en la fórmula de OOH versionaría todo el monorepo).

La inteligencia se **documenta como patrón**: el siguiente proyecto la consulta,
entiende cómo se resolvió, y reimplementa lo que necesite con su propia lógica.

## Patrones disponibles

| Patrón | Origen | Qué resuelve |
|--------|--------|--------------|
| [comisiones-escalonadas](./comisiones-escalonadas.md) | OOH Planner | Comisión por tramos progresivos + facilitadores ocultos |
| [rentabilidad-passthrough](./rentabilidad-passthrough.md) | OOH Planner | Margen con producción revendida con markup granular |
| [paginacion-postgrest](./paginacion-postgrest.md) | CUREX | Traer >1000 filas de Supabase/PostgREST |
| [comision-sobre-incremento](./comision-sobre-incremento.md) | CUREX | Monetizar sobre el delta de CPM, markup invisible |
| [emails-por-hitos](./emails-por-hitos.md) | CUREX / OOH | Emails automáticos por día desde alta, idempotentes |

## Cómo usar este catálogo

Al arrancar un proyecto nuevo:

1. Revisá qué packages de `/packages` podés instalar directo (infra lista).
2. Revisá este catálogo para ver si algún patrón de negocio se parece a lo que
   necesitás, y adaptá la solución (no copies el código de dominio crudo).
