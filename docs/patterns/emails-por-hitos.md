# Patrón: Emails automáticos por hitos, idempotentes

**Origen:** CUREX (cron publisher emails) + OOH Planner (Resend)
**Estado:** producción
**Infra relacionada:** `@federico/email` (el envío); este patrón es el *scheduling*

## Problema

Mandar una secuencia de emails a un usuario en días fijos desde su alta
(día 1, 3, 7, 15, 22, 30) sin mandar duplicados aunque el cron corra varias veces.

## Idea central

1. **Cron diario** (Vercel, ej. `0 10 * * *`) que cada día calcula qué usuarios
   cumplen X días desde `created_at` y les corresponde un trigger.
2. **Idempotencia con tabla de log:** `curex_email_log` con
   `UNIQUE(pub_id, day_trigger)`. Antes de enviar, insertar el registro; si viola
   el unique, ya se mandó → skip. Esto hace el cron seguro ante reintentos.
3. **Auth del endpoint** con header secreto (`Authorization: Bearer $CRON_SECRET`).

## Gotchas documentados

- En **PowerShell/Windows** el header `Authorization` lo intercepta el sistema y
  da 401. Para trigger manual usar otro header (`x-vercel-cron: 1`) en vez de
  `Authorization`.
- El secreto del cron NO debe vivir en archivos commiteados (rotarlo si se filtró).

## Cómo reusarlo

El par "cron diario + tabla de log con unique constraint" es el patrón de
idempotencia estándar para cualquier secuencia de notificaciones temporizadas
(onboarding drips, recordatorios, renovaciones). Combinar con `@federico/email`
para el envío.
