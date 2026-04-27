#!/bin/sh
set -eu

# BACKEND_URL: URL base del backend Django.
# Por defecto apunta al contenedor llamado "web" en la misma red Docker.
: "${BACKEND_URL:=http://web:8000}"

cat > /usr/share/nginx/html/env.js <<EOF
// Generado automáticamente al iniciar el contenedor. No editar.
window.__ENV__ = window.__ENV__ || {};
window.__ENV__.BACKEND_URL = "${BACKEND_URL}";
EOF

exec "$@"
