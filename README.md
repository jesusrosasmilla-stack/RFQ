# Control de Productividad — Línea Amarilla y Volquetes

Aplicación web para el control diario de productividad de equipos de **línea
amarilla** (excavadoras, motoniveladoras, retroexcavadoras, etc.) y **volquetes
(línea blanca)**, pensada para ser muy sencilla de usar en campo y controlada
por un administrador (el creador de la obra/proyecto).

## ¿Qué hace?

- **Línea amarilla**: cada equipo registra horómetro inicial y final del día, y
  las paradas/fallas mecánicas (hora de inicio y fin + motivo). El sistema
  calcula automáticamente:
  - **HM horómetro** (horas marcadas por el equipo).
  - **Horas disponibles** = jornada (07:00–18:00) − refrigerio − paradas.
  - **% de eficiencia** = HM horómetro / horas disponibles.
- **Volquetes (línea blanca)**: cada viaje registra hora de carguío, desplazamiento
  y descarga. El sistema calcula el **ciclo por viaje** y, al final del día, el
  **número de viajes** y el **ciclo promedio depurado** por volquete, descartando
  tiempos atípicos con el método estadístico de **rango intercuartílico (IQR)**
  (evita que una espera anormal distorsione el promedio).
- **Last Planner / PPC**: el administrador define una meta diaria por equipo
  (HM planificadas o viajes planificados) y el sistema calcula el **PPC (Percent
  Plan Complete)** del día, con causa de no cumplimiento cuando la meta no se
  logra.
- **Panel de productividad**: KPIs del día, eficiencia por equipo, horas
  muertas, causas de parada, viajes y ciclo por volquete, y una tendencia de
  los últimos 10 días.
- **Control de acceso**: el administrador habilita/deshabilita la captura de
  datos globalmente (ábrela al iniciar turno, ciérrala al finalizar) y también
  puede otorgar/revocar el acceso de cada operador individualmente. Un registro
  solo puede editarlo quien lo creó, el mismo día y mientras la captura esté
  abierta; fuera de eso, **solo el administrador** puede modificarlo o
  bloquearlo definitivamente.

## Requisitos

- Node.js 20 o superior.
- Una base de datos PostgreSQL (local o en la nube — Vercel Postgres/Neon,
  Supabase, Railway, etc. todas sirven).

## Instalación y ejecución local

```bash
npm install
cp .env.example .env      # edita DATABASE_URL (tu Postgres) y AUTH_SECRET (valor aleatorio)
npx prisma migrate deploy # crea las tablas
npm run seed                # crea el usuario administrador y equipos de ejemplo
npm run dev                  # http://localhost:3000
```

Usuario administrador inicial (definido en `prisma/seed.ts`):

- Usuario: `admin`
- Contraseña: `admin` (o la que definas en `SEED_ADMIN_PASSWORD` antes de
  correr `npm run seed`)

**Cambia esta contraseña de inmediato** desde el panel de Usuarios o generando
un hash propio.

## Despliegue

### En Vercel (recomendado — link en internet, sin servidor propio)

1. Importa este repositorio en Vercel (New Project → Import Git Repository).
2. En el proyecto, ve a **Storage → Create Database → Postgres** y conéctala
   al proyecto (esto agrega `DATABASE_URL` automáticamente).
3. En **Settings → Environment Variables**, agrega `AUTH_SECRET` con un valor
   aleatorio (por ejemplo generado con `openssl rand -base64 32`).
4. Vuelve a desplegar (Deployments → los tres puntos del último → Redeploy).
   El build corre `prisma migrate deploy` automáticamente, así que las tablas
   se crean solas.
5. Para cargar el usuario administrador y los equipos de ejemplo, corre una
   vez desde tu máquina (con `DATABASE_URL` apuntando a la base de Vercel,
   cópiala desde Storage → `.env.local`):
   ```bash
   npm run seed
   ```

Nota: las fotos (horómetro, equipo) se guardan en el disco del servidor
(`public/uploads`). En Vercel (entorno sin disco persistente) esas fotos no
se conservan entre despliegues — para uso productivo con fotos, lo ideal es
desplegar en un servidor con disco persistente (ver abajo) o migrar el
guardado de fotos a un bucket (S3, Vercel Blob, etc.).

### En un servidor propio / VPS (disco persistente, incluye fotos)

1. Define `DATABASE_URL` (tu Postgres) y un `AUTH_SECRET` real (ver
   `.env.example`).
2. Ejecuta `npm run build && npm start`.
3. Hacer respaldo periódico de la base de datos, ya que ahí vive toda la
   información capturada.

## Flujo de uso diario

1. **Administrador**: al iniciar la jornada (07:00), entra a *Usuarios* y
   presiona **"Abrir captura"**. Así los operadores pueden empezar a registrar
   datos desde sus celulares o PC.
2. **Operadores**: entran con su usuario y contraseña, eligen *Línea Amarilla*
   o *Volquetes*, seleccionan su equipo y registran los datos a medida que
   ocurren (horómetro, paradas, viajes).
3. **Administrador**: al finalizar la jornada (18:00), presiona **"Cerrar
   captura"** en *Usuarios*. A partir de ese momento los registros del día
   quedan protegidos: ya nadie (salvo el administrador) puede modificarlos.
4. **Administrador**: revisa el *Panel de Productividad* para ver eficiencia,
   tiempos muertos, ciclos de volquetes y el cumplimiento del plan (PPC), y
   define las metas del día siguiente en *Planificación*.

## Estructura del proyecto

- `prisma/schema.prisma` — modelo de datos (usuarios, equipos, registros,
  paradas, viajes, planificación, configuración).
- `src/lib/metrics.ts` — fórmulas de eficiencia de línea amarilla, cálculo de
  ciclos de volquetes y el promedio robusto (IQR) para descartar atípicos.
- `src/lib/access.ts` — reglas de acceso y edición de registros.
- `src/lib/actions/*` — Server Actions (mutaciones) con sus validaciones.
- `src/app/captura/*` — formularios de captura para operadores.
- `src/app/admin/*` — paneles de administración (usuarios, equipos,
  planificación, auditoría de registros).
- `src/app/dashboard` — panel de productividad con gráficos.

## Stack técnico

Next.js (App Router) + TypeScript + Prisma/PostgreSQL + NextAuth (Auth.js) +
Tailwind CSS + Recharts.
