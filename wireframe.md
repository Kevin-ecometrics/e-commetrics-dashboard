# Wireframe — E-commetrics Dashboard

> Color brand: `#BD155C` | Dark mode: soportado | Idiomas: ES / EN  
> Layout base: Sidebar colapsable (izquierda) + área de contenido (derecha)

---

## 1. Pantalla de Entrada `/`

```
┌─────────────────────────────────────────────────────────┐
│         FONDO DEGRADADO  #1E171E → #BD155C              │
│                                                         │
│           ┌──────────────────────────┐                  │
│           │   ¿Qué deseas hacer?     │  ← modal blanco  │
│           │                          │     rounded-2xl  │
│           │  [  Ingresar al Dashboard ]  ← botón #BD155C│
│           │                          │                  │
│           │  [  Conocer E-commetrics ]  ← botón gris   │
│           └──────────────────────────┘                  │
│                                                         │
│  Toggle idioma (ES | EN) — esquina superior derecha     │
└─────────────────────────────────────────────────────────┘
```

**Flujo:**
- Opción A → abre `<Login />` (mismo dominio, sin nav)
- Opción B → carga lazy `<Landing />` con animación Framer Motion

---

## 2. Login

```
┌────────────────────────────────────┐
│           Logo / Marca             │
│                                    │
│  Email     [_____________________] │
│  Password  [_____________________] │
│                                    │
│          [ Iniciar Sesión ]        │  ← #BD155C
│                                    │
│   ← Volver a la página principal   │
└────────────────────────────────────┘
```

**Estado de error:** toast rojo vía `react-hot-toast`.

---

## 3. Layout Dashboard (wrapper global)

```
┌──────────┬──────────────────────────────────────────────┐
│          │  🍞 Breadcrumb          [Toggle tema] [User] │
│ SIDEBAR  ├──────────────────────────────────────────────┤
│          │                                              │
│  Logo /  │                                              │
│  Brand   │           <página activa>                   │
│          │                                              │
│  ─────   │                                              │
│  Acciones│                                              │
│  (admin) │                                              │
│  ─────   │                                              │
│  Proyec- │                                              │
│  tos     │                                              │
│  ─────   │                                              │
│  Apps    │                                              │
│  ─────   │                                              │
│  Idioma  │                                              │
│          │                                              │
│  [User]  │                                              │
└──────────┴──────────────────────────────────────────────┘
```

### 3.1 Sidebar — Vista Admin

```
┌─────────────────────┐
│  [Logo] E-commetrics│
├─────────────────────┤
│ ACCIONES            │
│  > Clientes      ▾  │  ← dropdown: Crear / Actualizar
│  > Proyectos     ▾  │  ← dropdown: Crear / Actualizar
│  > Cont. Proy.   ▾  │  ← dropdown: Crear / Actualizar
│    🛡 Permisos       │
├─────────────────────┤
│ PROYECTOS           │
│  > Ver Proyectos ▾  │  ← dropdown con lista de proyectos
├─────────────────────┤
│ APPS                │
│  🔲 Generador QR    │
│  💳 Tarjeta Visita  │
│  📅 Calendario      │
│  📝 Gestor Blogs    │
│  📅 Cal. Reforma    │
│  📅 Cal. Monge      │
│  🏷 Promo Palmas    │
│  📅 Cal. Palmas     │  ← NUEVO
├─────────────────────┤
│ IDIOMA              │
│  🇬🇧 English        │
├─────────────────────┤
│  [Avatar] Usuario ▾ │
└─────────────────────┘
```

### 3.2 Sidebar — Vista Cliente

```
┌─────────────────────┐
│  [Logo] E-commetrics│
├─────────────────────┤
│ PROYECTOS           │
│  🗂 Proyecto A      │  ← solo sus proyectos (flat list)
│  🗂 Proyecto B      │
├─────────────────────┤
│ APPS  (solo can_view=true)
│  🔲 QR              │
│  📅 Calendario      │
├─────────────────────┤
│ IDIOMA              │
│  🇬🇧 English        │
├─────────────────────┤
│  [Avatar] Usuario ▾ │
└─────────────────────┘
```

---

## 4. Dashboard Principal `/dashboard`

```
┌──────────────────────────────────────────────────────┐
│  Tus Proyectos                    [N proyectos] [N ✓]│
│  Gestiona y supervisa todos tus proyectos            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ ● Título     │  │ ● Título     │  │ ● Título   │ │
│  │              │  │              │  │            │ │
│  │ 📁 Proyecto  │  │ 📁 Proyecto  │  │ 📁 Proyecto│ │
│  │ Nombre       │  │ Nombre       │  │ Nombre     │ │
│  │              │  │              │  │            │ │
│  │ Progreso 75% │  │ Progreso 40% │  │ Progreso   │ │
│  │ ████████░░░  │  │ ████░░░░░░░  │  │ 90% ██████ │ │
│  │              │  │              │  │            │ │
│  │ 📄 Desc...   │  │ 📄 Desc...   │  │ 📄 Desc... │ │
│  │              │  │              │  │            │ │
│  │ [Ir →]       │  │ [Ir →]       │  │ [Ir →]     │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                      │
│  Mostrando 3 proyectos                               │
└──────────────────────────────────────────────────────┘
```

**Colores de progreso:**
- `≥80%` → verde
- `50–79%` → amarillo
- `<50%` → rojo

**Estado vacío:** ilustración + mensaje + botón "Actualizar"

---

## 5. Detalle de Proyecto `/dashboard/[project_name]`

```
┌──────────────────────────────────────────────────────┐
│  Nombre del Proyecto                    [% progreso] │
│  Descripción general                                 │
├─────────────────────┬────────────────────────────────┤
│  FILTROS DE TIPO    │  CONTENIDO                     │
│                     │                                │
│  [ Todos ]          │  ┌──────────────────────────┐  │
│  [ Business & Obj ] │  │  Tipo: Business & Obj    │  │
│  [ MVP + IDEA ]     │  │  Título del ítem         │  │
│  [ Business Strat ] │  │  Descripción / detalle   │  │
│  [ Growth Hacking ] │  └──────────────────────────┘  │
│  [ Apps ]           │  ┌──────────────────────────┐  │
│                     │  │  Tipo: MVP + IDEA        │  │
│                     │  │  Título del ítem         │  │
│                     │  │  Descripción / detalle   │  │
│                     │  └──────────────────────────┘  │
└─────────────────────┴────────────────────────────────┘
```

**Tipos de contenido:** `Business and Objectives` | `MVP + IDEA` | `Business strategy` | `Growth Hacking strategy` | `Apps`

---

## 6. Gestión de Clientes (Admin)

### 6.1 Crear Cliente `/dashboard/create-client`

```
┌───────────────────────────────────────┐
│  Crear nuevo cliente                  │
│                                       │
│  Nombre de usuario  [______________]  │
│  Email              [______________]  │
│  Contraseña         [______________]  │
│  Rol                [admin / client▾] │
│                                       │
│            [ Crear Cliente ]          │  ← #BD155C
└───────────────────────────────────────┘
```

### 6.2 Actualizar Cliente `/dashboard/update-client`

```
┌───────────────────────────────────────┐
│  Actualizar cliente                   │
│                                       │
│  Seleccionar cliente  [__________ ▾]  │
│                                       │
│  Nombre de usuario  [______________]  │
│  Email              [______________]  │
│  Nueva contraseña   [______________]  │
│                                       │
│            [ Guardar cambios ]        │
└───────────────────────────────────────┘
```

---

## 7. Gestión de Proyectos (Admin)

### 7.1 Crear Proyecto `/dashboard/create-project`

```
┌───────────────────────────────────────┐
│  Crear nuevo proyecto                 │
│                                       │
│  Cliente            [__________ ▾]   │
│  Título             [______________]  │
│  Nombre (slug)      [______________]  │
│  Porcentaje         [__  ]%           │
│  Descripción        [______________]  │
│                     [______________]  │
│                                       │
│            [ Crear Proyecto ]         │
└───────────────────────────────────────┘
```

### 7.2 Actualizar Proyecto `/dashboard/update-project`

```
┌───────────────────────────────────────┐
│  Actualizar proyecto                  │
│                                       │
│  Seleccionar proyecto [________ ▾]    │
│                                       │
│  Título             [______________]  │
│  Porcentaje         [__  ]%           │
│  Descripción        [______________]  │
│                                       │
│            [ Guardar cambios ]        │
└───────────────────────────────────────┘
```

---

## 8. Gestión de Contenido de Proyecto (Admin)

### 8.1 Crear Contenido `/dashboard/create-project-content`

```
┌───────────────────────────────────────┐
│  Crear contenido de proyecto          │
│                                       │
│  Proyecto           [__________ ▾]   │
│  Tipo               [__________ ▾]   │
│    (Business & Obj / MVP / Strategy   │
│     / Growth Hacking / Apps)          │
│  Título             [______________]  │
│  Contenido          [______________]  │
│                     [______________]  │
│                     [______________]  │
│                                       │
│            [ Crear Contenido ]        │
└───────────────────────────────────────┘
```

### 8.2 Actualizar Contenido `/dashboard/update-project-content`

```
┌───────────────────────────────────────┐
│  Actualizar contenido                 │
│                                       │
│  Proyecto           [__________ ▾]   │
│  Ítem               [__________ ▾]   │
│                                       │
│  Tipo               [__________ ▾]   │
│  Título             [______________]  │
│  Contenido          [______________]  │
│                                       │
│            [ Guardar cambios ]        │
└───────────────────────────────────────┘
```

---

## 9. Permisos de Apps `/dashboard/access-app`

```
┌──────────────────────────────────────────────────────┐
│  Control de acceso a aplicaciones                    │
│                                                      │
│  Seleccionar usuario: [ _________________ ▾ ]       │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  🔲  QR Codes          [can_view: ○ / ●]       │  │
│  │  💳  Tarjetas Visita   [can_view: ○ / ●]       │  │
│  │  📝  Blogs             [can_view: ○ / ●]       │  │
│  │  📅  Calendario        [can_view: ○ / ●]       │  │
│  │  📅  Cal. Reforma      [can_view: ○ / ●]       │  │
│  │  📅  Cal. Monge        [can_view: ○ / ●]       │  │
│  │  🏷  Promo Palmas      [can_view: ○ / ●]       │  │
│  │  📅  Cal. Palmas       [can_view: ○ / ●]       │  │  ← NUEVO
│  └────────────────────────────────────────────────┘  │
│                                                      │
│                    [ 💾 Guardar ]                    │
└──────────────────────────────────────────────────────┘
```

---

## 10. Apps Especializadas

### 10.1 Generador QR `/dashboard/webapp/qr`

```
┌──────────────────────────────────────────────┐
│  Generador de Códigos QR                     │
│                                              │
│  URL / Texto  [__________________________]   │
│                                              │
│  [ Generar QR ]                              │
│                                              │
│  ┌──────────────┐                            │
│  │              │  ← preview QR generado     │
│  │   [QR IMG]   │                            │
│  │              │                            │
│  └──────────────┘                            │
│  [ Descargar ]                               │
└──────────────────────────────────────────────┘
```

### 10.2 Tarjeta de Visita (VCard) `/dashboard/webapp/vcard`

```
┌──────────────────────────────────────────────┐
│  Tarjeta de Visita Digital                   │
│                                              │
│  Nombre       [__________________________]   │
│  Cargo        [__________________________]   │
│  Empresa      [__________________________]   │
│  Teléfono     [__________________________]   │
│  Email        [__________________________]   │
│  Web          [__________________________]   │
│                                              │
│  [ Vista previa ]  [ Generar / Descargar ]   │
└──────────────────────────────────────────────┘
```

### 10.3 Calendario `/dashboard/webapp/calendar`

```
┌──────────────────────────────────────────────┐
│  Calendario                   [ MES ◀ ▶ ]   │
│                                              │
│  Lu  Ma  Mi  Ju  Vi  Sa  Do                 │
│   1   2   3   4   5   6   7                 │
│   8   9  10  11  12  13  14                 │
│  15  16  17  18  19  20  21  ← día activo   │
│  22  23  24  25  26  27  28                 │
│                                              │
│  Eventos del día seleccionado:               │
│  ┌────────────────────────────────────────┐  │
│  │  🕐 10:00  Evento 1                   │  │
│  │  🕐 14:00  Evento 2                   │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 10.4 Calendarios Reforma / Monge `/dashboard/webapp/calendar-reforma|monge`

> Misma estructura que 10.3 pero con datos específicos del cliente (Reforma / Monge).

### 10.5 Gestor de Blogs `/dashboard/webapp/blogs`

```
┌──────────────────────────────────────────────┐
│  Gestor de Blogs            [ + Nuevo Blog ] │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  📝 Título del blog         [Editar]   │  │
│  │  Fecha | Categoría                     │  │
│  │  Resumen del contenido...              │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │  📝 Título del blog 2       [Editar]   │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

### 10.6 Promo Palmas `/dashboard/webapp/promo-palmas`

```
┌──────────────────────────────────────────────┐
│  Promo Palmas                                │
│                                              │
│  [Contenido promocional / formulario /       │
│   visualización según implementación]        │
│                                              │
└──────────────────────────────────────────────┘
```

### 10.7 Calendario Palmas `/dashboard/webapp/calendario-palmas`  ← NUEVO

> Dashboard de reservas para Palmas Recovery (`palmasrecovery.com`).
> Color de acento: `amber-500` en lugar del `#BD155C` corporativo.

```
┌──────────────────────────────────────────────────────────────┐
│  [🕐] Calendario Palmas          [+ Nueva Reserva] [↺]       │
│  Panel de reservas y contactos · Palmas Recovery             │
├─────────────────┬──────────────┬──────────────┬─────────────┤
│  🛏 Total Res.  │  ✓ Confirm.  │  $ Ingresos  │  💬 Contact.│
│     — (num)     │    — (num)   │  $0 USD      │   — (num)   │
├─────────────────┴──────────────┴──────────────┴─────────────┤
│  [ Calendario ]  [ Reservas (N) ]  [ Contactos (N) ]        │
├──────────────────────────────────────────────────────────────┤
│  TAB: CALENDARIO                                             │
│                                                              │
│  Filtros habitación: [Todas] [Shared] [Private]             │
│                      [Large Private] [VIP Suite]             │
│                                                              │
│  ┌────────────────────────────┐  ┌──────────────────────┐   │
│  │  ◀  Mayo 2026  ▶           │  │  Día seleccionado    │   │
│  │  Dom Lun Mar Mié Jue Vie Sáb│  │                      │   │
│  │   .   .   .   .   1   2   3│  │  [+ Nueva] (si futuro│   │
│  │   4   5   6  ...          │  │                      │   │
│  │  ● = habitac. confirmada  │  │  Reserva 1:          │   │
│  │  ○ = habitac. cancelada   │  │   [Room badge]       │   │
│  │  🔴 = todo ocupado        │  │   Nombre huésped     │   │
│  │                            │  │   check-in → checkout│   │
│  │  Leyenda: 🔵🟢🟣🟡 salas  │  │   [Cancelada badge]  │   │
│  └────────────────────────────┘  └──────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│  TAB: RESERVAS                                               │
│                                                              │
│  Tabla: # Confirm. | Huésped | Habitación | Check-in        │
│         Check-out | Noches | Total | Estado | Origen | [👁]  │
│                                                              │
│  Origen badge: 🖥 Manual (dashboard) | 🌐 Sitio web         │
│  Estado badge: ✓ Confirmada (verde) | ✕ Cancelada (rojo)    │
├──────────────────────────────────────────────────────────────┤
│  TAB: CONTACTOS                                              │
│                                                              │
│  Tabla: Nombre | Email + Teléfono | Mensaje | Fecha         │
└──────────────────────────────────────────────────────────────┘
```

**Modal "Nueva / Editar Reserva":**
```
┌──────────────────────────────────────────────┐
│  Nueva Reserva / Editar Reserva          [X] │
├──────────────────────────────────────────────┤
│  Habitación *                                │
│  [Shared] [Private] [Large Private] [VIP]    │
│                                              │
│  Datos del huésped                           │
│  Nombre *   [___________] Email *  [_______] │
│  Teléfono * [___________] Cirujano*[_______] │
│                                              │
│  Fechas *                                    │
│  Check-in [____] Check-out [____] Noches(auto│
│                                              │
│  Precios                                     │
│  Huéspedes [_] Precio/noche[$__] Total[$___] │
│                                    (auto)    │
│                                              │
│  Extras (checkboxes con precio)              │
│  ☑ Lymphatic Massage          $60            │
│  ☐ 5 Massages Package         $270           │
│  ☐ Recovery Bra B01G          $80   ...      │
│                                              │
│  Código promocional                          │
│  [CÓDIGO____] [ Aplicar ]                    │
│  ← descuento % o fijo, con breakdown        │
│                                              │
│  Solicitudes especiales [________________]   │
│                                              │
│            [Cancelar] [Crear reserva]        │
└──────────────────────────────────────────────┘
```

**Modal "Detalle de Reserva":**
```
┌──────────────────────────────────────────────┐
│  #CONF-NUMBER                           [X]  │
│  Nombre del huésped    [Editar] [Cancelar]   │
├──────────────────────────────────────────────┤
│  [✓ Confirmada] [🛏 Room] [🖥 Manual/🌐Web] │
│                                              │
│  Email / Teléfono / Cirujano / Solicitudes   │
│                                              │
│  [ Check-in ] | [ Noches ] | [ Check-out ]   │
│                                              │
│  Extras desglosados con precios              │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  Total: $X,XXX USD          (amber)  │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

**Habitaciones disponibles:**

| ID | Nombre | Precio base |
|---|---|---|
| `shared` | Shared Room | $170/noche |
| `private` | Private Room | $180/noche |
| `large-private` | Large Private Room | $200/noche |
| `vip` | VIP Suite | $250/noche |

**Extras disponibles:** Lymphatic Massage ($60), 5 Massages Package ($270), Recovery Bra B01G ($80), Open Bust Vest FVOM ($80), Reinforced Girdle SFBHRS ($140), Girdle High-Back SFBHS2 ($140).

---

## 11. Cuenta de Usuario `/dashboard/account`

```
┌──────────────────────────────────────────────┐
│  Mi Cuenta                                   │
│                                              │
│  [Avatar]  Nombre de usuario                 │
│            email@ejemplo.com                 │
│            Rol: admin / client               │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Cambiar contraseña                    │  │
│  │  Contraseña actual  [______________]   │  │
│  │  Nueva contraseña   [______________]   │  │
│  │  Confirmar nueva    [______________]   │  │
│  │                [ Actualizar ]          │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

---

## 12. Chatbot `/` (flotante global)

```
                       ┌────────────────────────┐
                       │  E-commetrics Chat  [X] │
                       │  ──────────────────────  │
                       │  [Mensaje del bot...]   │
                       │                         │
                       │  [Mensaje usuario...]   │
                       │                         │
                       │  [Escribe tu mensaje__] │
                       │                [ ➤ ]   │
                       └────────────────────────┘
                                          [💬]   ← botón flotante
```

---

## 13. Página 404 `/not-found`

```
┌──────────────────────────────────────────────┐
│                                              │
│           404 — Página no encontrada         │
│                                              │
│      [ ← Volver al Dashboard ]              │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Mapa de Flujo General

```
/
├── [Login] → /dashboard
│               ├── /dashboard/[project_name]
│               ├── /dashboard/account
│               ├── /dashboard/webapp/qr
│               ├── /dashboard/webapp/vcard
│               ├── /dashboard/webapp/calendar
│               ├── /dashboard/webapp/calendar-reforma
│               ├── /dashboard/webapp/calendar-monge
│               ├── /dashboard/webapp/blogs
│               ├── /dashboard/webapp/promo-palmas
│               ├── /dashboard/webapp/calendario-palmas  ← NUEVO
│               └── (admin only)
│                   ├── /dashboard/create-client
│                   ├── /dashboard/update-client
│                   ├── /dashboard/create-project
│                   ├── /dashboard/update-project
│                   ├── /dashboard/create-project-content
│                   ├── /dashboard/update-project-content
│                   └── /dashboard/access-app
└── [Landing] (página informativa)
```

---

## Notas de Diseño

| Elemento | Valor |
|---|---|
| Color principal | `#BD155C` |
| Fondo oscuro | `#1E171E` |
| Fuente de iconos | `lucide-react` + `react-icons` |
| Animaciones | Framer Motion v12 (`motion`) |
| Notificaciones | `react-hot-toast` |
| Tema oscuro | `next-themes` con `attribute="class"` |
| Componentes UI | shadcn/ui (Radix UI + CVA + tailwind-merge) |
| Idiomas | ES (default) / EN — cookie `lang` |
