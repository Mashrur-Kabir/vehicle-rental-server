---
PROJECT:
---

---

# Vehicle Booking System with Node.js Backend (Express, TypeScript, PostgreSQL, JWT Auth & RBAC)

The backend powers a **Vehicle Booking System**, built using a clean, modular, and secure architecture.

It is designed to handle:

- User authentication & role-based access
- Vehicle management
- Booking management
- Secure API structure with clean layering
- PostgreSQL cloud database
- Type-safe development using TypeScript

The structure ensures the project remains **scalable, easy to expand, highly secure**

---

## Tech Stack

- **Express.js** – Fast HTTP server + routing
- **TypeScript** – Strict typing and maintainability
- **TSX** – Run TS files without compiling
- **PostgreSQL (NeonDB)** – Cloud-hosted relational DB
- **bcryptjs** – Secure password hashing
- **jsonwebtoken (JWT)** – Authentication and RBAC
- **Modular Architecture** – Clean folder separation

---

# Installation & Setup

## 1. Initialize Project

```bash
npm init -y
```

Remove `"type": "commonjs"` from `package.json` if present.

---

## 2. Install Dependencies

```bash
npm install express pg bcryptjs jsonwebtoken dotenv
npm install --save-dev typescript tsx @types/express @types/bcryptjs @types/jsonwebtoken @types/pg
```

---

## 3. Initialize TypeScript

```bash
npx tsc --init
```

Update `tsconfig.json`:

```json
"rootDir": "./src",
"outDir": "./dist"
```

Comment out unused sections:

```json
// "jsx": "react-jsx",
// "verbatimModuleSyntax": true
```

---

## 4. Development Script (TSX)

Add in `package.json`:

```json
"scripts": {
  "dev": "npx tsx watch ./src/server.ts"
}
```

Run:

```bash
npm run dev
```

> **TSX is faster, zero config, and far better than ts-node for dev use.**

---

# PostgreSQL Setup (NeonDB)

1. Create a NeonDB project
2. Copy the connection string
3. Install PostgreSQL client:

```bash
npm install pg
npm install --save-dev @types/pg
```

4. Setup `/src/config/db.ts` using PG Pool:

```ts
import { Pool } from "pg";
import config from "./index";

const pool = new Pool({
  connectionString: config.connection_str,
});

export default pool;
```

> Pooling = faster queries & optimized performance.

Tables used:

- **users**
- **vehicles**
- **bookings**

---

# Environment Variables

Install dotenv:

```bash
npm i dotenv
```

Inside `/src/config/index.ts`:

```ts
import dotenv from "dotenv";
dotenv.config();

const config = {
  connection_str: process.env.CONNECTION_STR,
  jwt_secret: process.env.JWT_SECRET,
  port: process.env.PORT || 5000,
};

export default config;
```

### Create `.env`

```
CONNECTION_STR=your_neon_connection
JWT_SECRET=someLongSecureRandomHexKey
PORT=5000
```

Add to `.gitignore`:

```
.env*
node_modules
```

---

# Project Modularization (Clean Architecture)

The structure follows:

```
route → controller → service → db
```

### Why?

- Routes define only the endpoints
- Controllers handle request/response
- Services contain logic (DB queries, validation, hashing)
- DB layer centralizes all database access

This makes the system scalable and enterprise-ready.

---

# Middleware

| Middleware  | Purpose                         |
| ----------- | ------------------------------- |
| `logger.ts` | Logs all requests for debugging |
| `auth.ts`   | JWT authentication + RBAC       |

---

# Authentication System (JWT + bcrypt)

### 🔐 Password Hashing

Signup:

```ts
const hashedPassword = await bcrypt.hash(password, 10);
```

Login:

```ts
bcrypt.compare(plainPassword, hashedPasswordFromDB);
```

> Hashed passwords = safe even if DB leaks.

---

# JWT Tokens

Generate token in `auth.service.ts`:

```ts
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  config.jwt_secret,
  { expiresIn: "7d" }
);
```

Client sends:

```
Authorization: Bearer <token>
```

Middleware verifies:

```ts
const token = req.headers.authorization?.split(" ")[1];
const decoded = jwt.verify(token, config.jwt_secret);
req.user = decoded;
```

If roles mismatch:

```ts
if (roles.length && !roles.includes(decoded.role)) {
  return res.status(403).json({ error: "Unauthorized" });
}
```

---

# RBAC (Role-Based Access Control)

Roles:

- **Admin** → create/manage vehicles, view all bookings, manage users
- **User** → book vehicles, view their own bookings

Example:

```ts
router.post("/vehicles", auth("admin"), vehicleController.createVehicle);
```

---

# Modules Overview

The project includes 4 major modules:

---

## 1. Auth Module

Handles:

- Signup
- Login
- JWT issuing
- Password hashing
- Role assignment

Files:

```
/modules/auth
  ├── auth.routes.ts
  ├── auth.controller.ts
  └── auth.service.ts
```

---

## 2. Users Module

Admin can:

- View all users
- Manage user roles

Users can:

- View their own profile

Files:

```
/modules/users
  ├── user.routes.ts
  ├── user.controller.ts
  └── user.service.ts
```

---

## 3. Vehicles Module

Handles:

- Adding vehicles (Admin)
- Updating vehicle data
- Listing all available vehicles
- Managing availability

Files:

```
/modules/vehicles
  ├── vehicle.routes.ts
  ├── vehicle.controller.ts
  └── vehicles.service.ts
```

---

## 4. Bookings Module

Handles:

- Creating a booking
- Fetching user bookings
- Admin viewing all bookings
- Enforcing vehicle availability

Files:

```
/modules/bookings
  ├── booking.routes.ts
  ├── booking.controller.ts
  └── booking.service.ts
```

---

# App & Server

### `app.ts`

- Loads middleware
- Registers routes
- Exports app

### `server.ts`

```ts
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

# Production Build & Deployment (Vercel)

This section explains how to prepare the backend for **production** and deploy it to **Vercel** using the CLI.

---

## 1. Create Production Build

Inside your `package.json`, under `"scripts"`, add:

```json
"build": "tsc"
```

Now run:

```bash
npm run build
```

This will generate a **dist/** folder containing compiled `.js` files.

### Add `dist/` to `.gitignore`

```
dist
```

Why?

> The `dist` folder is auto-generated. You never push build files to Git.
> Deployment platforms like Vercel generate their own builds.

---

## 2. Deploy to Vercel Using CLI

### Install the Vercel CLI globally:

```bash
npm i -g vercel
```

### Login to Vercel:

```bash
vercel login
```

You will receive a link like:

```
https://vercel.com/oauth/device?user_code=XXXXXXX
```

Open it in your browser → approve → logged in.

---

## 3. Create `vercel.json` Configuration

Inside the root of your project, create:

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

Why `server.js` and NOT `server.ts`?

- Vercel runs **Node.js**, which only executes **JavaScript**, not TypeScript.
- Your TypeScript code gets compiled into `/dist/server.js` after running `npm run build`.
- Therefore, deployment must point to the compiled JS file.

---

## Deploy to Production

Run:

```bash
vercel --prod
```

Follow prompts:

| Prompt               | Answer      |
| -------------------- | ----------- |
| Set up project?      | **Y**       |
| Existing project?    | **N**       |
| Project name         | your choice |
| Which directory?     | `./`        |
| Additional settings? | **N**       |
| Pull env variables?  | **Y**       |
| Connect Git repo?    | **N**       |

Your deployment starts.

At the end you’ll see:

- **Inspect URL** → check logs
- **Domain URL** → your live API

---

## 5. Fixing Common 404 (Missing Environment Variables)

If your API shows 404 or server errors, you may have missed environment variables.

### Add environment variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Open **Settings → Environment Variables**
3. Click **Import**
4. Upload your local `.env` file
5. **Remove PORT** (`PORT` must NOT exist on Vercel — it will auto-assign one)
6. Save

---

## 6. Redeploy After Updating Environment Variables

```bash
vercel --prod
```

After deployment completes:

- Open **Inspect URL** → check logs
- Click the **Domain URL** → the backend is live

---

## Deployment Summary

- Build TypeScript → JavaScript
- Deploy only compiled JS
- Configure Vercel to use `dist/server.js`
- Move environment variables → Vercel Dashboard
- Never set `PORT` manually on Vercel

---

# Final Project Structure

```bash
VehicleBookingAPI/
├── node_modules/
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── logger.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.service.ts
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.service.ts
│   │   ├── vehicles/
│   │   │   ├── vehicle.controller.ts
│   │   │   ├── vehicle.routes.ts
│   │   │   └── vehicles.service.ts
│   │   ├── bookings/
│   │   │   ├── booking.controller.ts
│   │   │   ├── booking.routes.ts
│   │   │   └── booking.service.ts
│   ├── types/
│   │   └── express/
│   │       └── index.d.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

---
