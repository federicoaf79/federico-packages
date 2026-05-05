# federico-packages

Monorepo de paquetes compartidos del ecosistema **Frey Hub**.

Este repo agrupa los módulos JavaScript reutilizables que consumen los proyectos del ecosistema:

- **OOHPlanner** — planificador de campañas OOH
- **Plan-B** — plataforma de mensajería multicanal
- **COMUNAS** — herramientas para gestión comunal
- **Urban Tales** — narrativas urbanas

## Estructura

```
packages/
  planb-client/   # SDK JS para la API REST de Plan-B
  auth/           # Autenticación compartida (placeholder)
  ui/             # Componentes de UI compartidos (placeholder)
```

## Uso

Este repo usa [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces). Para instalar todas las dependencias:

```bash
npm install
```

Para ejecutar tests en todos los paquetes:

```bash
npm test
```

## Paquetes

### `@federico/planb-client`

SDK JavaScript para consumir la API REST de Plan-B (`https://plan-b.lat/api/v1`).

```js
import { PlanBClient } from '@federico/planb-client';

const client = new PlanBClient({ apiKey: process.env.PLANB_API_KEY });
await client.send({ to: '+5491100000000', message: 'Hola', channel: 'whatsapp' });
```

### `@federico/auth`

Placeholder — pendiente de implementación.

### `@federico/ui`

Placeholder — pendiente de implementación.
