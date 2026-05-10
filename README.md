# federico-packages

## Qué es esto

Monorepo de packages compartidos del ecosistema **Frey Hub**.

**NO es donde viven las apps** — es la biblioteca que consumen.

## Estructura del ecosistema

El ecosistema Frey Hub está formado por 4 repos independientes que **consumen** los packages publicados desde este monorepo:

- `comunas-app` → repo propio
- `oohplanner-app` → repo propio
- `plan-b` → repo propio
- `urban-tales` → repo propio

```
                    ┌──────────────────────┐
                    │  federico-packages   │
                    │  (este monorepo)     │
                    │                      │
                    │  @federico/planb-client
                    │  @federico/auth      │
                    │  @federico/ui        │
                    └──────────┬───────────┘
                               │ instalan
              ┌────────────┬───┴────┬────────────┐
              ▼            ▼        ▼            ▼
         comunas-app  oohplanner  plan-b   urban-tales
```

## Packages disponibles

| Package | Estado | Descripción |
|---------|--------|-------------|
| `@federico/planb-client` | activo | SDK para la API de Plan-B (`send`, `getStatus`) |
| `@federico/auth` | placeholder | Auth compartido (pendiente) |
| `@federico/ui` | placeholder | Componentes de UI compartidos (pendiente) |

## Cómo instalar en un proyecto

### Desde GitHub (MVP — hasta 3 proyectos)

```bash
npm install github:PlanB1205/federico-packages#workspace=@federico/planb-client
```

### Desde npm privado (escala — 3+ municipios)

Publicar en **GitHub Packages** (~$4/mes) cuando haya 3+ municipios consumiendo los paquetes.

## Uso básico de `planb-client`

```js
import { PlanBClient } from '@federico/planb-client'

const client = new PlanBClient({
  apiKey: process.env.PLANB_API_KEY,
  baseUrl: 'https://plan-b.lat/api/v1'
})

await client.send({
  to: '+543851234567',
  message: 'Tu turno es mañana a las 09:30',
  channel: 'auto',
  metadata: { turno_id: 'T-0042', municipio: 'real-sayana' }
})
```

## Cuándo conectar cada proyecto

1. **COMUNAS — día 12 del sprint** → instalar `planb-client` cuando Plan-B tenga su API REST lista.
2. **Segundo municipio** → mover componentes reutilizables de COMUNAS a `@federico/comunas-core`.

## Roadmap de packages

- **v0.1.0** (actual) → `planb-client` básico
- **v0.2.0** → auth compartido con Supabase
- **v0.3.0** → componentes UI (`CalendarioSemanal`, `TurnoItem`, etc.)
- **v1.0.0** → `comunas-core` (hooks, helpers, design system)
