#!/bin/sh
set -e

echo "Esperando a que la base de datos esté lista..."

# Esperar hasta que PostgreSQL esté listo (máximo 30 intentos, 2 segundos cada uno)
until nc -z db 5432; do
  echo "Base de datos no disponible, esperando..."
  sleep 2
done

echo "Base de datos lista, sincronizando esquema..."

# Si hay migraciones, aplicarlas. Si no, usar db push para crear el esquema
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
  echo "Aplicando migraciones existentes..."
  npx prisma migrate deploy
else
  echo "No hay migraciones, creando esquema desde el schema.prisma..."
  npx prisma db push --accept-data-loss || true
fi

echo "Esquema sincronizado, iniciando aplicación..."

# Verificar que el build existe
if [ ! -f "dist/main.js" ] && [ ! -f "dist/src/main.js" ]; then
  echo "Error: dist/main.js no encontrado. Reconstruyendo..."
  npm run build
  if [ ! -f "dist/main.js" ] && [ ! -f "dist/src/main.js" ]; then
    echo "Error: No se pudo construir la aplicación"
    exit 1
  fi
fi

# Ejecutar el comando principal
exec "$@"

