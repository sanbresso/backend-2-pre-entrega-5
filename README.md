# Plataforma de Eventos e Inscripciones

## Pre-entrega 5 — Roles y autorización profesional

Proyecto de **PBE II — Diseño y Arquitectura Backend (Coderhouse)** desarrollado con Node.js, Express, MongoDB Atlas y Mongoose. Esta entrega continúa las anteriores e incorpora **autorización por roles (RBAC)**, **validación de propiedad de eventos (Ownership)** y protección de rutas con respuestas HTTP diferenciadas.

### Evolución del proyecto

- **Pre-entrega 1:** arquitectura modular de Express, modelos y rutas iniciales.
- **Pre-entrega 2:** registro de usuarios, bcrypt, validaciones y persistencia MongoDB.
- **Pre-entrega 3:** login, JWT firmado, cookie HttpOnly `currentUser`, sesión actual y logout.
- **Pre-entrega 4:** estrategias Passport.js `register`, `login` y `current`.
- **Pre-entrega 5:** roles `user`, `organizer`, `admin`, middlewares de autorización reutilizables, creación/edición de eventos y ruta administrativa.

## Tecnologías

- Node.js y JavaScript ESM (`"type": "module"`)
- Express 5, MongoDB Atlas, Mongoose
- bcrypt, jsonwebtoken, cookie-parser
- Passport.js (`passport-local`, `passport-jwt`)
- dotenv, Git y GitHub

## Instalación y ejecución

1. Clonar el repositorio público de la Pre-entrega 5 (cuando esté publicado):

   ```bash
   git clone https://github.com/sanbresso/backend-2-pre-entrega-5.git
   cd backend-2-pre-entrega-5
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Crear un archivo `.env` en la raíz a partir de `.env.example` y completar los valores privados:

   ```dotenv
   PORT=8080
   NODE_ENV=development
   MONGO_URL=mongodb+srv://USUARIO:CONTRASENA@TU_CLUSTER.mongodb.net/plataforma_eventos
   JWT_SECRET=REEMPLAZAR_POR_CLAVE_SECRETA_SEGURA
   JWT_EXPIRES_IN=1h
   ```

4. Iniciar el servidor con MongoDB conectado:

   ```bash
   npm run dev
   ```

   Para ejecución normal, usar `npm start`. El script de desarrollo usa **`node --watch src/server.js`** (no nodemon). La URL base de los ejemplos es `http://localhost:8080`.

> **Seguridad:** nunca subir `.env`, `node_modules/`, JWT, contraseñas, hashes o credenciales de MongoDB. `.env.example` contiene solo valores de ejemplo y `.gitignore` excluye los archivos privados. El comando `npm test` todavía es un marcador; las verificaciones de esta entrega fueron manuales con Postman.

## Arquitectura

```text
src/
├── app.js
├── server.js
├── config/
│   ├── db.js
│   └── passport.config.js
├── models/
│   ├── User.js
│   └── Event.js
├── routes/
│   ├── health.router.js
│   ├── sessions.router.js
│   ├── events.router.js
│   └── admin.router.js
├── controllers/
│   ├── health.controller.js
│   ├── sessions.controller.js
│   ├── events.controller.js
│   └── admin.controller.js
├── services/
│   ├── sessions.service.js
│   └── events.service.js
├── repositories/
│   └── users.repository.js
├── dao/
│   └── users.dao.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── authorize.middleware.js
│   ├── eventOwnership.middleware.js
│   └── error.middleware.js
└── utils/
    ├── hash.js
    └── jwt.js
```

Las **rutas** enlazan middlewares y controladores; los **controladores** construyen respuestas HTTP; los **servicios** contienen reglas de negocio y validaciones; **repositorios/DAO** encapsulan acceso a usuarios; **modelos** definen los esquemas Mongoose. Los middlewares concentran las verificaciones de autenticación, rol y propiedad del evento.

## Usuarios y registro seguro

El modelo `User` define `first_name`, `last_name`, `email`, `password`, `role` y timestamps. El campo `role` acepta `user`, `organizer` y `admin`, con valor predeterminado **`user`**. La contraseña se guarda como hash de bcrypt y su campo está configurado con `select: false`.

**POST `/api/sessions/register`** acepta nombre, apellido, email y contraseña (mínimo ocho caracteres). El servicio siempre asigna `role: "user"`, aun cuando el cliente intente enviar `"role": "admin"` o `"role": "organizer"`.

Ejemplo:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "ana@example.com",
  "password": "ClaveDePrueba123!",
  "role": "admin"
}
```

El rol de la cuenta creada será **`user`** y la respuesta **201 Created** no expondrá la contraseña ni el hash. Errores habituales: **400** por datos inválidos y **409** por email duplicado. La promoción de roles se hizo manualmente en MongoDB Atlas únicamente con cuentas de prueba; no hay una ruta pública para conceder privilegios.

## Roles y matriz de permisos

| Acción | `user` | `organizer` | `admin` |
|---|:---:|:---:|:---:|
| Consultar eventos publicados | ✅ | ✅ | ✅ |
| Consultar sesión propia | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar eventos propios | ❌ | ✅ | ✅ |
| Modificar eventos de otros | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

`GET /api/events` es público y, por lo tanto, también está disponible sin autenticación. En esta entrega, la autorización RBAC se expresa mediante `authorizeRoles(...allowedRoles)` en las rutas. La propiedad del evento se valida adicionalmente en `eventOwnership`.

## Autenticación, autorización y Ownership

1. **Autenticación:** `authMiddleware` busca el JWT en la cookie HttpOnly `currentUser`, verifica el token y asigna `req.user` (`id`, `email`, `role`). Si falta o es inválido devuelve **401**. La ruta `/api/sessions/current` conserva la autenticación a través de la estrategia Passport `current`.
2. **Autorización RBAC:** `authorizeRoles("organizer", "admin")` o `authorizeRoles("admin")` comprueba el rol después de autenticar. Si el usuario autenticado no tiene permisos devuelve **403**.
3. **Ownership:** para `PATCH /api/events/:id`, `eventOwnership` busca el evento y compara `event.organizer` con `req.user.id`. Solo pasa un organizador propietario o un administrador.
4. **Controlador:** únicamente se ejecuta si se superaron las verificaciones previas.

El rol no se toma del body enviado por el usuario: procede del JWT validado. Como mejora futura, se puede consultar el rol vigente en la base de datos para que los cambios de permisos tengan efecto antes de la expiración del token.

## Rutas HTTP

| Método | Ruta | Acceso | Respuestas principales |
|---|---|---|---|
| GET | `/api/health` | Público | 200 |
| GET | `/api/sessions` | Público | 200 |
| POST | `/api/sessions/register` | Público | 201, 400, 409 |
| POST | `/api/sessions/login` | Público | 200, 400, 401 |
| GET | `/api/sessions/current` | Autenticado | 200, 401 |
| POST | `/api/sessions/logout` | Cierre de cookie | 200 |
| GET | `/api/events` | Público: solo publicados | 200 |
| POST | `/api/events` | `organizer`, `admin` | 201, 400, 401, 403 |
| PATCH | `/api/events/:id` | `organizer` propietario, `admin` | 200, 400, 401, 403, 404 |
| GET | `/api/admin/users` | Solo `admin` | 200, 401, 403 |

### Login y cookie

**POST `/api/sessions/login`**

```json
{
  "email": "organizador@example.com",
  "password": "ClaveDePrueba123!"
}
```

Respuesta **200 OK**:

```json
{ "status": "success", "message": "Login correcto" }
```

El servidor establece `currentUser` con `HttpOnly`, `SameSite=Lax`, una hora de duración y `Secure` en producción. El token no se incluye en el JSON de respuesta. `GET /api/sessions/current` devuelve el `id`, `email` y `role` del usuario autenticado. `POST /api/sessions/logout` elimina la cookie; esto no revoca criptográficamente un JWT que alguien haya conservado.

### Crear evento

**POST `/api/events`** (con cookie de `organizer` o `admin`):

```json
{
  "title": "Congreso Tech 2026",
  "description": "Encuentro de tecnología",
  "date": "2026-12-15",
  "capacity": 100
}
```

Respuesta ilustrativa **201 Created**:

```json
{
  "status": "success",
  "payload": {
    "id": "ID_DEL_EVENTO",
    "title": "Congreso Tech 2026",
    "description": "Encuentro de tecnología",
    "date": "2026-12-15T00:00:00.000Z",
    "capacity": 100,
    "status": "draft",
    "organizer": "ID_DEL_USUARIO_AUTENTICADO"
  }
}
```

El organizador se obtiene de `req.user.id`, **nunca** de `req.body.organizer`. Los eventos nuevos se crean como `draft`. Por eso no aparecen en `GET /api/events`, que devuelve solo los eventos con estado `published`.

### Modificar evento

**PATCH `/api/events/:id`** con cookie autorizada y un ID de evento real:

```json
{
  "title": "Congreso Tech 2026 - Actualizado",
  "capacity": 120
}
```

Un organizador solo puede modificar los recursos cuyo `organizer` coincida con su ID; un administrador puede modificar cualquiera. La actualización admite `title`, `description`, `date` y `capacity`, pero no permite cambiar el propietario ni publicar arbitrariamente mediante estos campos.

### Consultar usuarios (solo admin)

**GET `/api/admin/users`** devuelve **200 OK** y un arreglo `payload` con identificador, nombre, apellido, email, rol y fecha de creación. Se emplea una selección explícita de campos en MongoDB; **no se devuelven contraseñas ni hashes**.

## Códigos de error

| Código | Significado | Ejemplo |
|---|---|---|
| **400 Bad Request** | Datos inválidos | Título vacío o ID de evento mal formado |
| **401 Unauthorized** | No autenticado | Cookie ausente, inválida o vencida |
| **403 Forbidden** | Autenticado sin permiso | `user` crea evento; `organizer` modifica evento ajeno |
| **404 Not Found** | Recurso inexistente | Evento no encontrado |
| **409 Conflict** | Conflicto de negocio | Email ya registrado |
| **500 Internal Server Error** | Fallo imprevisto | Error interno, sin exponer detalles técnicos |

Ejemplo **401**:

```json
{ "status": "error", "message": "No autenticado" }
```

Ejemplo **403** por rol:

```json
{ "status": "error", "message": "No tenés permisos para realizar esta acción" }
```

Ejemplo **403** por propiedad:

```json
{ "status": "error", "message": "No tenés permisos para modificar este evento" }
```

El middleware global conserva errores controlados con `statusCode` entre 400 y 599 y utiliza 500 para errores inesperados.

## Pruebas manuales realizadas en Postman

| Prueba | HTTP observado |
|---|---:|
| `POST /api/events` sin cookie | 401 |
| `POST /api/events` con `user` | 403 |
| `POST /api/events` con `organizer` | 201 |
| `PATCH /api/events/:id` con organizador propietario | 200 |
| `PATCH /api/events/:id` con organizador no propietario | 403 |
| `PATCH /api/events/:id` con administrador sobre evento ajeno | 200 |
| `GET /api/admin/users` con administrador | 200 |
| `GET /api/admin/users` con organizador | 403 |
| `GET /api/admin/users` sin cookie | 401 |
| `POST /api/events` con título vacío y organizer autenticado | 400 |

También se verificaron el registro, login, consulta de sesión actual y logout durante las entregas anteriores. Las pruebas son manuales: todavía no se implementó una suite automatizada.

Para reproducir las pruebas: registrar cuentas de prueba; asignar manualmente los roles `organizer` o `admin` en MongoDB Atlas; **volver a iniciar sesión** para emitir un JWT actualizado; y enviar las solicitudes correspondientes con Postman. Para probar el 401, eliminar la cookie `currentUser`. Se recomienda adjuntar capturas con método, URL, código y respuesta, ocultando cookies, JWT y contraseñas.

## Seguridad y alcance

- El registro público asigna siempre `user` desde el servidor.
- Los permisos se validan en middlewares del backend; ocultar botones del frontend no es protección suficiente.
- Los eventos tienen un `organizer` obligatorio para permitir el control de propiedad.
- El listado administrativo no incluye contraseñas ni hashes.
- La consulta de eventos públicos filtra por `status: "published"`.
- En sistemas desplegados públicamente convendría agregar protección CSRF, limitación de intentos de login, gestión de revocación de JWT y comprobación de roles vigentes contra MongoDB.
- El CRUD completo de eventos, las inscripciones y las notificaciones quedan fuera del alcance implementado en esta pre-entrega.

## Publicación

El repositorio público debe incluir `package.json`, `package-lock.json`, `.gitignore`, `.env.example`, `README.md` y el código fuente. **No** publicar `.env`, `node_modules`, secretos, credenciales reales ni cookies de sesión.