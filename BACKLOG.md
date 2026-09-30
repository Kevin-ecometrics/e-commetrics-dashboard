# Backlog

Última actualización: **2026-09-30**.

Orden de prioridad: de arriba hacia abajo. No empezar un punto hasta cerrar el anterior.

## 1. Cerrar el módulo CRM (en curso)

El frontend del CRM (`src/app/dashboard/webapp/crm/`) está listo y **ya commiteado**, pero
**sin subir** al hosting. El estado detallado y los pasos viven en el repo de Reforma:
`ReformaDental2025/CRM_STATUS.md` y `ReformaDental2025/CRM_USUARIOS.md`.

Pendiente para darlo por cerrado:

- [ ] Build y subida de `out/` a `public_html` (hosting actual, aún estático).
- [ ] Probar de punta a punta: dashboard → CRM → login propio → pipeline → crear y editar
      un lead → enviar plantilla → "Sync now".
- [ ] Revisar la consola del navegador: sin errores de CORS hacia `https://reformadental.com/crm`.
- [x] Commitear `access-app/page.tsx`, `app-sidebar.tsx` y `webapp/crm/`.
- [ ] Si un usuario **no admin** debe ver el CRM: agregar `"CRM"` a `allComponents` en
      `GET /api/users/:id/apps` del backend del dashboard y marcarle el permiso.

## 2. Migrar el frontend a Vercel (siguiente feature tras el CRM)

**Objetivo:** que el frontend deje de ser estático y de subirse a mano, para que crear una
ruta o un proyecto nuevo no exija build y subida cada vez.

**Decisión (2026-09-30):** frontend en Vercel, dinámico (sin `output: 'export'`);
backend, bases de datos, cron **e imágenes subidas se quedan en cPanel**.

**Alcance:** solo el frontend. El backend Express, las bases de datos y el cron
**se quedan en cPanel**. No mover Express a Vercel: el cron del CRM (sync de Facebook cada
5 min) y las conexiones persistentes a MySQL no encajan en funciones serverless.

**Imágenes:** no se necesita bucket. Multer guarda en `server/public/images/` del backend
(`dashboard.js`), Express las sirve con `express.static`, la base de datos guarda la ruta
relativa `/images/<archivo>` y el frontend la antepone con `NEXT_PUBLIC_URL`. El navegador
sube y pide las imágenes directo al backend, así que Vercel no interviene. Vercel no puede
guardar subidas (disco temporal); un bucket (Vercel Blob, R2, S3) solo haría falta si algún
día se sacan las imágenes de cPanel.

```
Navegador ──► e-commetrics.com (Vercel)   ← solo el frontend
                 ├──► backend Express del dashboard (cPanel)   /api/... y /images/...
                 └──► reformadental.com/crm (cPanel)           /crm/...
```

### Por qué

- `next.config.ts` tiene `output: 'export'`: todo se genera como HTML fijo en `out/`.
- `src/app/dashboard/[project_name]/page.tsx` pide los datos **en el build**
  (`generateStaticParams` y el `fetch` de la página). Un proyecto nuevo no tiene página
  hasta el siguiente build, y el contenido queda congelado en el HTML.
- En Vercel, sin `output: 'export'`, esa ruta se genera al primer acceso con datos
  frescos, y cada `git push` despliega solo.

### Ya está preparado

- Sin rutas de API de Next ni middleware: todo va por `fetch` al backend Express.
- URL del backend en `NEXT_PUBLIC_URL`; la del CRM fija en `webapp/crm/lib/api.ts`
  (`CRM_API`). Ninguna cambia al mudarse.
- El CRM ya está pensado para llamarse desde otro dominio (CORS + token `Bearer`).

### Pasos

1. **Preparar el código**
   - [ ] Quitar `output: 'export'` de `next.config.ts`.
   - [ ] En `[project_name]/page.tsx` agregar `export const dynamic = "force-dynamic";`
         (o `revalidate = 60` si se acepta un minuto de retraso).
   - [ ] Leer `ProjectClient` y confirmar si ya recarga datos en el navegador.
   - [ ] Confirmar que toda imagen (incl. `source` de `project_content`) se renderiza con el
         prefijo `NEXT_PUBLIC_URL`; ninguna ruta relativa sola.
   - [ ] Si se usa `next/image` con imágenes del backend, agregar su dominio a
         `images.remotePatterns` en `next.config.ts`.
   - [ ] `next build` limpio y revisar página por página lo que cambie.
2. **Crear el proyecto en Vercel**
   - [ ] Conectar el repo (rama `main`).
   - [ ] Definir `NEXT_PUBLIC_URL` en Vercel (Settings → Environment Variables) con la URL
         pública del backend Express del dashboard, sin barra final, en Production y
         Preview. Vercel no lee el `.env` local; sin la variable, las llamadas y las
         imágenes irían a `undefined/...`. Es variable de build (se incrusta al compilar):
         si se cambia, hay que hacer redeploy. Es pública, solo la URL del backend: nunca
         poner claves ahí. `CRM_API` no necesita variable (fija en `webapp/crm/lib/api.ts`).
   - [ ] Desplegar primero en la URL `*.vercel.app` **solo para revisar el build y el
         render**. El login no funcionará ahí (ver CORS abajo); es esperado.
3. **Dominio**
   - [ ] Apuntar `e-commetrics.com` a Vercel (dominio propio). Es requisito, no opcional.
   - [ ] Cambiar **solo** el registro del sitio web. No tocar los MX ni los registros del
         correo.
   - [ ] Bajar el TTL del DNS con antelación para poder volver atrás rápido.
4. **Verificar en producción**
   - [ ] Login del dashboard (cookie de sesión).
   - [ ] Entrar al CRM y a las demás apps.
   - [ ] Crear un proyecto nuevo desde el dashboard y abrir su página **sin hacer deploy**.
   - [ ] Editar el contenido de un proyecto y comprobar que se ve al momento.
   - [ ] Subir una foto de perfil y una imagen de contenido; comprobar que se ven (vienen
         del backend en cPanel).
5. **Retirar lo anterior**
   - [ ] Dejar el hosting estático de cPanel como respaldo unos días.
   - [ ] Después, borrar `out/` de `public_html`.

### Riesgos y cuidados

- **CORS y cookies.** El backend del dashboard tiene el CORS fijo a
  `https://e-commetrics.com`, `http://localhost:3000` y
  `https://foodhub-software.vercel.app`, y la cookie de sesión es `httpOnly`,
  `secure`, `sameSite: none`. El backend de Reforma acepta `e-commetrics.com` y
  `www.e-commetrics.com`. Con dominio propio no hay que tocar nada. Con `*.vercel.app`
  el login y el CRM fallan. Si se quiere probar ramas en URLs de Vercel, hay que agregarlas
  a la lista de ambos backends.
- **`www.e-commetrics.com`** no está en el CORS del backend del dashboard (sí en el de
  Reforma). Decidir si se usa y añadirlo, o redirigirlo al dominio sin `www`.
- **Llamadas desde el servidor de Vercel.** `[project_name]/page.tsx` llama al backend
  desde los servidores de Vercel, no desde el navegador. Comprobar que el backend no
  bloquee IPs externas.
- **Un push malo va directo a producción.** Proteger `main` y usar ramas y previews para
  revisar antes de fusionar.
- **Plan de Vercel.** El plan gratuito tiene límites y es de uso no comercial. Revisar si
  hace falta el plan Pro, al ser una plataforma con clientes.
- **Imágenes en disco de cPanel.** Un redeploy del backend que sobrescriba `server/public/`
  las borraría. Respaldar esa carpeta antes de desplegar el backend.
- **Ver también** el punto 3: la seguridad del backend debe arreglarse pronto
  independientemente de esta migración.

### Criterio de "hecho"

Un `git push` publica los cambios sin subir nada a mano, y un proyecto creado desde el
dashboard tiene su página al momento, con el backend y las bases de datos intactos en cPanel.

## 3. Endurecer el backend del dashboard (`dashboard.js`)

Hallazgos leídos del código; **no se probaron contra el servidor**. Son independientes de
la migración a Vercel y conviene hacerlos pronto.

- [ ] `JWT_SECRET` está escrito en el código (`"mi-clave-super-secreta"`): pasarlo a
      variable de entorno. Al desplegarlo se cierran todas las sesiones.
- [ ] `PUT /api/users/:id` **sin autenticación** y acepta `password`: cualquiera puede
      cambiar la contraseña de cualquier usuario, admin incluido. Es el más grave.
- [ ] `GET /api/users` sin auth y con `SELECT *`: expone los hashes de contraseña.
- [ ] `POST /api/register`, `DELETE /api/users/:id`, `POST /api/users/:id/apps`,
      `PUT /api/update-profile` sin auth. `PUT /api/change-password` toma el `id` del cuerpo.
- [ ] Contraseña SMTP de facturación escrita en el código: pasarla a variable de entorno.
- [ ] `/api/register` envía la contraseña en texto plano por correo.
- [ ] Middleware `requireAuth` y `requireAdmin` para las rutas de listado y escritura.
- [ ] Añadir `"CRM"` a `allComponents` (si no se hizo ya en el punto 1).
- [ ] Rutas de subida (`/api/upload-profile-image`, `/api/projects/content`,
      `PUT /api/project_content/:id`): exigir sesión, y limitar tamaño y tipo de archivo en
      multer.

## 4. Ideas para más adelante

- **Login único** entre el dashboard y el CRM (hoy son dos logins separados, decisión de
  2026-09-29). Reconsiderar si hay 3 o más apps con login propio, si los usuarios del CRM
  crecen o rotan mucho, o si se ofrece el CRM a otros clientes. Requiere un endpoint de
  token en el backend del dashboard y firma asimétrica (ES256). Antes hay que cerrar el
  punto 3.
- **Pantalla de usuarios dentro del CRM** (crear, listar, borrar). Hoy se crean por SQL;
  ver `ReformaDental2025/CRM_USUARIOS.md`. No compensa con pocos usuarios.
- **Pruebas** de la lectura de reglas y del motor de automatización del CRM (un bug ahí
  pasó inadvertido).
