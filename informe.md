# Práctica Servidor Web con Contenerización (Docker + Backend + Frontend)

## 1. Título

**Implementación de un Sistema Web Contenerizado con Docker (Backend, Frontend y Base de Datos)**

## 2. Tiempo de duración

60 minutos

## 3. Fundamentos

Para comprender esta práctica es necesario entender varios conceptos relacionados con la infraestructura moderna, contenerización, desarrollo web y gestión de aplicaciones distribuidas. Actualmente, gran parte de los sistemas se despliegan usando contenedores debido a su eficiencia, portabilidad y facilidad para replicar entornos idénticos en diferentes máquinas.

Un contenedor es una unidad de software ligera que empaqueta código, dependencias, librerías e incluso configuraciones necesarias para ejecutar una aplicación. A diferencia de las máquinas virtuales, los contenedores no requieren un sistema operativo completo, sino que comparten el kernel del host, permitiendo un uso eficiente de recursos.

El motor más usado para contenedores es Docker, el cual permite construir imágenes, administrarlas y ejecutar contenedores con facilidad. La tecnología clave dentro de Docker es el Dockerfile, un archivo donde se describe cómo construir una imagen personalizada. Por ejemplo, un backend en NestJS o un frontend en React pueden contener instrucciones como copiar archivos, instalar dependencias y ejecutar compilaciones.

Otro concepto importante es Docker Compose, una herramienta que permite orquestar varios contenedores a la vez. En vez de ejecutar contenedores manualmente, Docker Compose permite levantar entornos completos como:

- Un servidor backend
- Un frontend web
- Una base de datos PostgreSQL
- Un servidor web como Nginx

Estos servicios se definen mediante un único archivo YAML, indicando redes internas, puertos y relaciones entre contenedores.

En esta práctica, utilizamos un backend en NestJS, un frontend en React + TypeScript, y una base de datos PostgreSQL, todos integrados en un solo entorno contenerizado.

Además, se deben comprender conceptos de redes, puertos, comunicación entre contenedores, variables de entorno, APIs REST y construcción de interfaces con React. La comunicación entre servicios se realiza usando nombres internos (ej.: `db:5432`) y los puertos se exponen al host para consumo externo.

### Figura 1-1. Diagrama de contenedores

```
+-----------------------+
|      FRONTEND         |
|  React / Vite         |
|  Puerto 5173          |
+----------+------------+
           |
           | http://backend:3001
           |
+----------+------------+
|       BACKEND         |
|   NestJS + Prisma     |
|   Puerto 3001         |
+----------+------------+
           |
           | postgresql://db:5432
           |
+----------+------------+
|        DATABASE       |
|     PostgreSQL        |
|     Puerto 5432       |
+-----------------------+
```

## 4. Conocimientos previos

Para desarrollar correctamente esta práctica, el estudiante debe tener conocimientos básicos en:

- Manejo de comandos Linux
- Conceptos de redes
- Manejo de navegadores web
- Lectura de documentación técnica
- Conocimientos básicos de desarrollo web
- Uso básico de Docker

## 5. Objetivos a alcanzar

- Implementar contenedores usando Docker para un sistema web.
- Utilizar Docker Compose para orquestar múltiples servicios.
- Desplegar un backend desarrollado en NestJS.
- Desplegar un frontend desarrollado en React y TypeScript.
- Configurar una base de datos PostgreSQL como contenedor.
- Manipular archivos de configuración como:
  - `Dockerfile`
  - `docker-compose.yml`
  - `schema.prisma`
- Validar comunicación entre contenedores.
- Visualizar datos desde el frontend en una tabla de productos.

## 6. Equipo necesario

- Docker Desktop o Docker Engine instalado
- Docker Compose v2+
- Editor de código (VS Code recomendado)t
- Navegador

## 7. Material de apoyo

- Documentación oficial de Docker: https://docs.docker.com
- Cheat sheet de comandos Linux
- Documentación de React: https://react.dev
- Guía de la asignatura
- Apuntes del docente

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

![Dockerfile del backend](img/Screenshot%202025-12-07%20222453.png)

### Paso 3: Crear el Dockerfile del backend

Se crea el archivo `backend/Dockerfile` con instrucciones para construir la imagen.

![Dockerfile del backend](img/Screenshot%202025-12-07%20222546.png)

### Paso 4: Configurar el frontend React

- Crear proyecto con `npm create vite@latest`
- Crear tabla de productos en React
- Consumir el API del backend

![Dockerfile del backend](img/Screenshot%202025-12-07%20222637.png)

### Paso 5: Crear el Dockerfile del frontend

Archivo `frontend/Dockerfile`.

![Dockerfile del backend](img/Screenshot%202025-12-07%20222715.png)

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

  backend:
    build: ./backend
    restart: always
    depends_on:
      - db
    environment:
      DATABASE_URL: "postgresql://admin:admin123@db:5432/inventory"
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  dbdata:
```

### Paso 7: Levantar los contenedores

```bash
docker-compose up --build
```

![Dockerfile del backend](img/Screenshot%202025-12-07%20215311.png)

### Paso 8: Verificar funcionamiento

- **Frontend**: http://localhost:5173
![Dockerfile del backend](img/Screenshot%202025-12-07%20215228.png)

- **Backend**: http://localhost:3001/products
![Dockerfile del backend](img/Screenshot%202025-12-07%20215219.png)

## 9. Resultados esperados

Se espera que el sistema levante correctamente en contenedores.

El navegador debe mostrar una tabla de productos cargada desde el backend.

El backend debe exponer un servicio REST que devuelve un JSON con los productos.

Docker Compose debe iniciar los tres servicios sin errores.

La base de datos PostgreSQL debe persistir los datos.

## 10. Bibliografía

- Docker. (2024). Docker Documentation. https://docs.docker.com
- NestJS. (2024). NestJS Official Docs. https://docs.nestjs.com
- React. (2024). React Official Guide. https://react.dev
- Prisma. (2024). Prisma ORM Documentation. https://www.prisma.io/docs
