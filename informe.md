# TAS10 - Aplicación en modo producción

## 1. Título

**Despliegue de una aplicación web en modo producción utilizando Docker, Nginx, NestJS, Prisma y PostgreSQL**

---

## 2. Tiempo de duración

80 min

---

## 3. Fundamentos

El uso de contenedores se ha convertido en un estándar dentro del desarrollo y despliegue de aplicaciones modernas. Docker permite empaquetar una aplicación junto con todas sus dependencias, garantizando que se ejecute de la misma forma en cualquier entorno, ya sea local, académico o de producción. Esto soluciona problemas clásicos como incompatibilidades de versiones, configuraciones distintas entre equipos o dependencias faltantes.

En esta práctica se trabaja con una arquitectura compuesta por tres partes principales: frontend, backend y base de datos. El frontend corresponde a una aplicación web que, en un entorno de producción, no debe ejecutarse en modo desarrollo, sino que debe ser previamente construida (build) y servida como archivos estáticos. Para este propósito se utiliza Nginx, un servidor web ligero y altamente eficiente, ampliamente usado en producción para servir contenido estático.

El backend está desarrollado con NestJS, un framework de Node.js orientado a la construcción de aplicaciones escalables y mantenibles. Para la gestión de la base de datos se utiliza Prisma ORM, que permite definir modelos de datos de forma declarativa y generar automáticamente las consultas necesarias. En esta práctica se emplea PostgreSQL como sistema de gestión de base de datos relacional, ejecutándose dentro de su propio contenedor.

Docker Compose se utiliza como herramienta de orquestación, permitiendo definir y ejecutar múltiples contenedores de manera conjunta mediante un solo archivo de configuración. Gracias a Docker Compose, los servicios pueden comunicarse entre sí utilizando nombres de servicio en lugar de direcciones IP, facilitando la integración entre frontend, backend y base de datos.

## 4. Conocimientos previos

Para realizar esta práctica se debe tener claros los siguientes temas:

* Uso básico de comandos Linux.
* Conceptos básicos de Docker y contenedores.
* Uso de archivos de configuración.
* Conocimientos básicos de Node.js.

---

## 5. Objetivos a alcanzar

* Desplegar una aplicación frontend en modo producción utilizando Nginx.
* Implementar contenedores Docker para frontend, backend y base de datos.
* Integrar NestJS con Prisma y PostgreSQL dentro de un entorno Docker.
* Orquestar múltiples contenedores mediante Docker Compose.
* Comprender la comunicación entre contenedores usando nombres de servicio.

---

## 6. Equipo necesario

* Computador con sistema operativo Windows, Linux o macOS.
* Docker Desktop o Docker Engine instalado.
* Docker Compose.
---

## 7. Material de apoyo

* Documentación oficial de Docker.
* Documentación oficial de Nginx.
* Documentación oficial de NestJS.
* Documentación oficial de Prisma.
* Guía de la asignatura.
* Cheat sheet de comandos Linux.

---

## 8. Procedimiento

### Paso 1: Crear la estructura del proyecto

Crear una carpeta principal:

```
inventory-system/
  backend/
  frontend/
  docker-compose.yml
```

### Paso 2: Configurar el backend NestJS

- Crear el proyecto NestJS
- Instalar Prisma y generar el esquema
- Agregar el modelo Product
- Crear el controlador y servicio

![Dockerfile del backend](img/Screenshot%202025-12-14%20212844.png)

### Paso 3: Crear el Dockerfile del backend

Se crea el archivo `backend/Dockerfile` con instrucciones para construir la imagen.

```Dockerfile
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

```

### Paso 4: Configurar el frontend React

- Crear proyecto con `npm create vite@latest`
- Crear tabla de productos en React
- Consumir el API del backend

![Dockerfile del backend](img/Screenshot%202025-12-14%20212906.png)

### Paso 5: Crear el Dockerfile del frontend

Archivo `frontend/Dockerfile`.

```Dockerfile
# Etapa de build
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build de producción con variable de entorno
ARG VITE_API_URL=http://backend:3000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine

# Copiar los archivos build al directorio de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx (opcional)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        rewrite ^/api/(.*) /$1 break; \
        proxy_pass http://backend:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Paso 6: Crear el archivo docker-compose.yml

```yml
version: '3.9'

services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: inventory
    ports:
      - "5432:5432"
    volumes:
      - dbdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d inventory"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: "postgresql://admin:admin123@db:5432/inventory"
    ports:
      - "3000:3000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=http://backend:3000
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:3000

volumes:
  dbdata:
```

### Paso 7: Levantar los contenedores

```bash
docker-compose up --build -d
```

![Dockerfile del backend](img/Screenshot%202025-12-14%20213407.png)

### Paso 8: Verificar funcionamiento


Se levantan todos los servicios utilizando Docker Compose y se valida la comunicación entre ellos.

![Dockerfile del backend](img/Screenshot%202025-12-14%20213513.png)

---

## 9. Resultados esperados

Al finalizar la práctica se obtiene una aplicación web completamente funcional en modo producción, donde:

* El frontend se accede desde el navegador mediante Nginx.
* El backend responde correctamente a las peticiones.
* La base de datos PostgreSQL almacena la información de forma persistente.
* Todos los servicios se ejecutan de manera aislada en contenedores.

![Dockerfile del backend](img/Screenshot%202025-12-14%20213639.png)

---

## 10. Bibliografía

Docker Inc. (2024). *Docker Documentation*. [https://docs.docker.com/](https://docs.docker.com/)

Nginx Inc. (2024). *Nginx Documentation*. [https://nginx.org/en/docs/](https://nginx.org/en/docs/)

NestJS. (2024). *NestJS Documentation*. [https://docs.nestjs.com/](https://docs.nestjs.com/)

Prisma. (2024). *Prisma ORM Documentation*. [https://www.prisma.io/docs/](https://www.prisma.io/docs/)
