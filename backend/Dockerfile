FROM node:20

WORKDIR /app

# Instalar netcat para verificar la conexión a la base de datos
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

# Compilar el código TypeScript
RUN npm run build

# Verificar que el build se completó correctamente
RUN (test -f dist/main.js || test -f dist/src/main.js) || (echo "Error: Build failed - main.js not found" && ls -la dist/ && exit 1)

EXPOSE 3000

# Script para esperar a la base de datos y ejecutar migraciones
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start:prod"]
