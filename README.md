# Webapp Taller X

Sistema de gestión web para talleres mecánicos. Permite administrar inventario, clientes y presupuestos digitales.

## Tecnologías

- **Frontend:** React + Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js + Express, Prisma ORM
- **Base de datos:** PostgreSQL
- **Auth:** JWT + bcryptjs

## Requisitos previos

- Node.js v20+
- PostgreSQL instalado y corriendo

## Instalación

### 1. Clonar el repositorio

```bash
git clone git@github.com:emimgg/tallerShop.git
cd tallerShop
```

### 2. Configurar la base de datos

```bash

# Crear la base de datos
sudo -u postgres psql -c "CREATE DATABASE tallershop;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres123';"
```

### 3. Configurar el backend

```bash
cd backend
npm install
```

Crear el archivo `.env` en la carpeta `backend`:

```
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/tallershop?schema=public"
JWT_SECRET="cualquier_clave_secreta_aqui"
```

Luego correr las migraciones:

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Configurar el frontend

```bash
cd ../frontend
npm install --legacy-peer-deps
```

## Correr el proyecto

Abrir dos terminales:

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Abrir el navegador en `http://localhost:5173`

## Primer uso

Registrar un usuario en:

```json
POST http://localhost:3001/api/auth/register
{
  "name": "Tu nombre",
  "email": "tu@email.com",
  "password": "tupassword"
}
```

O usar Bruno/Postman para hacer el request.
