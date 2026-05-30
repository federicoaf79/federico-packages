# federico-packages

## Qué es esto

Monorepo de packages compartidos del ecosistema **Frey Hub**.

**NO es donde viven las apps** — es la biblioteca que consumen, más un catálogo
de patrones de negocio para reusar soluciones al construir proyectos nuevos.

## Estructura del ecosistema

```
                    ┌──────────────────────┐
                    │  federico-packages   │
                    │  (este monorepo)     │
                    │                      │
                    │  packages/  → código importable
                    │  docs/patterns/ → inteligencia documentada
                    └──────────┬───────────┘
                               │ instalan / consultan
        ┌────────────┬─────────┼─────────┬────────────┐
        ▼            ▼         ▼         ▼            ▼
   oohplanner     curex    comunas  urban-tales  (próximo proyecto)
        │            │         │
        └────────────┴─────────┴──▶ Plan-B (servicio de mensajería SMS/WA)
                                    consumido vía @federico/planb-client
```

**Apps del ecosistema** (consumen Frey Hub): oohplanner, comunas, curex, urban-tales.
**Servicios que el ecosistema consume:** Plan-B — mensajería SMS/WhatsApp, vía
`@federico/planb-client`. Plan-B vive en su propia cuenta (plan-b.lat); el SDK
para hablarle vive acá porque lo usan las apps.

## Dos tipos de reutilización

1. **`/packages` — código que se importa.** Solo infraestructura genérica que
   sirve igual a cualquier proyecto.
2. **`/docs/patterns` — inteligencia de negocio documentada.** Soluciones
   específicas de cada proyecto (comisiones, rentabilidad, pricing) descritas
   como referencia, NO como código compartido. Ver
   [docs/patterns/README.md](./docs/patterns/README.md) para el porqué.

## Packages disponibles

| Package | Estado | Descripción |
|---------|--------|-------------|
| `@federico/utils` | activo | `cn`, `formatCurrency` (locale parametrizable), `formatDate`, `getInitials` |
| `@federico/supabase` | activo | Factory de cliente + `fetchAllPaginated` (límite 1000 filas) |
| `@federico/email` | activo | Envío vía Edge Function (Resend) |
| `@federico/images` | activo | `validateArtwork` + `generateMockup` (perspectiva canvas) — browser-only |
| `@federico/planb-client` | activo | SDK para la API de Plan-B (`send`, `getStatus`) |
| `@federico/auth` | placeholder | Auth compartido (pendiente) |
| `@federico/ui` | placeholder | Componentes de UI compartidos (pendiente) |

## Cómo instalar en un proyecto

### Desde GitHub (MVP — pocos proyectos)

```bash
npm install github:federicoaf79/federico-packages#workspace=@federico/utils
```

### Desde npm privado (escala)

Publicar en **GitHub Packages** (~$4/mes) cuando varios proyectos consuman los
paquetes y haga falta versionado real.

## Origen de los módulos

Los packages activos `utils`, `supabase`, `email` e `images` fueron extraídos y
generalizados desde **oohplanner-app** (`src/lib/`), que es el proyecto más
maduro del ecosistema. La lógica de dominio de OOH (comisiones, rentabilidad) NO
se extrajo: vive documentada en `docs/patterns`.

## Roadmap de packages

- **v0.1.0** (actual) → utils, supabase, email, images, planb-client
- **v0.2.0** → `@federico/auth` (Supabase + roles, fuente: oohplanner guards/context + curex login)
- **v0.3.0** → `@federico/ui` (design system; fuente: oohplanner components/ui + comunas)
- **v0.4.0** → `@federico/pdf` (jsPDF + html2canvas; fuente: oohplanner + curex)

## Próximos consumidores

1. **oohplanner-app** → migrar sus `lib/` para que importen desde acá en vez de local.
2. **curex** → adoptar `@federico/supabase` (fetchAllPaginated ya lo usa inline).
3. **comunas** → cuando se apruebe, nace consumiendo Frey Hub desde el día 1.
