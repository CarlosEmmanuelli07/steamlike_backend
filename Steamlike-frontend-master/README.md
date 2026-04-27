# GameLib — Frontend

Frontend de referencia para el proyecto de backend Django de **DWES (UA6 + UA7)**.

Construido con **React + TypeScript + Bootstrap 5**, dockerizado con build multietapa (Vite → nginx).

---

## Arquitectura

```
gamelib-frontend/
├── Dockerfile                  # Build multietapa: Node 20 → nginx 1.27
├── docker/
│   ├── nginx.conf              # SPA fallback + no-cache en /env.js
│   └── entrypoint.sh           # Genera /env.js con BACKEND_URL al arrancar
├── index.html                  # Carga /env.js antes que el bundle
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── App.tsx                 # Definición de rutas (react-router-dom)
    ├── main.tsx                # Punto de entrada, BrowserRouter
    ├── lib/
    │   ├── env.ts              # Lee BACKEND_URL en runtime (window.__ENV__)
    │   ├── api.ts              # apiFetch: wrapper fetch con CSRF y credentials
    │   ├── csrf.ts             # Lectura de cookie csrftoken de Django
    │   └── types.ts            # Tipos TypeScript compartidos
    ├── components/
    │   ├── Layout.tsx          # Navbar, footer, flash messages, menú de usuario
    │   └── ApiAlert.tsx        # Muestra errores de la API con detalles
    └── pages/
        ├── Home.tsx            # Pantalla de inicio con links a secciones
        ├── Login.tsx           # POST /api/auth/login/
        ├── Register.tsx        # POST /api/auth/register/
        ├── Library.tsx         # GET /api/library/entries/ + resolve
        ├── LibraryNew.tsx      # POST /api/library/entries/
        ├── LibraryDetail.tsx   # GET + PATCH + PUT /api/library/entries/{id}/
        ├── CatalogSearch.tsx   # GET /api/catalog/search/
        ├── ChangePassword.tsx  # POST /api/users/me/password/
        └── DeleteAccount.tsx   # DELETE /api/users/me/
```

### Cómo funciona BACKEND_URL

La URL del backend **no se fija en tiempo de build**: se inyecta cuando arranca el contenedor.

1. `docker/entrypoint.sh` lee la variable de entorno `BACKEND_URL` y escribe `/env.js`:
   ```js
   window.__ENV__ = { BACKEND_URL: "http://tu-backend:8000" };
   ```
2. `index.html` carga ese archivo antes que el bundle de React.
3. `src/lib/env.ts` lee `window.__ENV__.BACKEND_URL` en tiempo de ejecución.

Esto permite usar **la misma imagen Docker** en local, staging y producción cambiando solo la variable.

En desarrollo local sin Docker, crea `.env.local`:
```
VITE_BACKEND_URL=http://localhost:8000
```

---

## Rutas de la API consumidas

| Método | Ruta | Semana | Descripción |
|--------|------|--------|-------------|
| POST | `/api/auth/register/` | UA6-S2 | Registro de usuario |
| POST | `/api/auth/login/` | UA6-S2 | Login con sesión |
| POST | `/api/auth/logout/` | UA7-S4 | Cierre de sesión (204) |
| GET  | `/api/users/me/` | UA6-S2 | Usuario autenticado |
| POST | `/api/users/me/password/` | UA7-S4 | Cambio de contraseña |
| DELETE | `/api/users/me/` | UA7-S4 | Eliminar cuenta |
| GET  | `/api/library/entries/` | UA6-S1 | Listado de biblioteca |
| POST | `/api/library/entries/` | UA6-S1 | Crear entrada |
| GET  | `/api/library/entries/{id}/` | UA6-S1 | Detalle de entrada |
| PATCH | `/api/library/entries/{id}/` | UA6-S1 | Actualización parcial |
| PUT  | `/api/library/entries/{id}/` | UA7-S4 | Sustitución completa |
| GET  | `/api/catalog/search/?q=` | UA7-S3 | Búsqueda en CheapShark |
| POST | `/api/catalog/resolve/` | UA7-S3 | Resolver IDs a título+thumb |

---

## Puesta en marcha

### Opción A — Con la imagen de Docker Hub (recomendado para alumnos)

Añadir al `docker-compose.yml` del backend:

```yaml
services:
  web:        # contenedor Django ya existente
    ...

  frontend:
    image: TU_USUARIO/gamelib-frontend:latest
    ports:
      - "3000:80"
    environment:
      - BACKEND_URL=http://web:8000
    depends_on:
      - web
```

```bash
docker compose up
```

Frontend disponible en **http://localhost:3000**.

### Opción B — Build local

```bash
docker build -t gamelib-frontend .

docker run -p 3000:80 \
  -e BACKEND_URL=http://web:8000 \
  --network <red-del-backend> \
  gamelib-frontend
```

### Opción C — Desarrollo sin Docker

```bash
npm install
echo "VITE_BACKEND_URL=http://localhost:8000" > .env.local
npm run dev
# Abre http://localhost:5173
```

---

## Publicar en Docker Hub (profesor)

```bash
docker build -t gamelib-frontend .
docker tag gamelib-frontend TU_USUARIO/gamelib-frontend:latest
docker login
docker push TU_USUARIO/gamelib-frontend:latest
```

---

## Requisitos del backend Django

Para que el frontend funcione correctamente:

```python
# settings.py
CSRF_COOKIE_HTTPONLY = False      # la cookie csrftoken debe ser legible desde JS
SESSION_COOKIE_SAMESITE = "Lax"  # cookies de sesión en peticiones cross-origin

# Si el frontend está en un origen distinto (ej: localhost:3000 vs localhost:8000):
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = True
```
