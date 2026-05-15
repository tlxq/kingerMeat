<div align="center">
  <img src="./client/public/img/logo.png" width="400" />

# Kinger Meat
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-5-black?logo=express)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)
![Zod](https://img.shields.io/badge/Zod-Validation-3068B7)
![Status](https://img.shields.io/badge/status-active-success)
![API](https://img.shields.io/badge/API-REST-orange)
![Frontend](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Utility_First-38B2AC?logo=tailwind-css)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render)
![Neon](https://img.shields.io/badge/Database-Neon-00E599)
![CLI](https://img.shields.io/badge/CLI-Custom-informational)
![Observability](https://img.shields.io/badge/Observability-Integrated-purple)
![Maintained](https://img.shields.io/badge/Maintained-Yes-brightgreen)
![Open Source](https://img.shields.io/badge/Open_Source-Yes-success)

**Premium wild game meat from Sörmland – Powered by a robust Node.js/TypeScript backend.**

[Live Site](https://kingermeat.ttdevs.com) • [API Endpoint](https://api.kingermeat.ttdevs.com) • Technical Report: [English](./docs/TECHNICAL_REPORT_EN.md) / [Swedish](./docs/TECHNICAL_REPORT_SV.md)

</div>

---

## Overview

Kinger Meat is an online shop for wild game meat, built as a final project for the Backend Development course at Yrkeshögskolan i Borås. While the frontend provides a usable shop interface, the project's core strength lies in its **production-ready backend architecture**.

![Startup Preview](./client/public/img/startup.gif)

---

## Core Features

### Developer Experience

The custom CLI provides an intuitive interface for managing the server and probing the API directly from your terminal.

![CLI Help](./client/public/img/help.gif)

### Advanced Observability

The project includes a custom **`kingermeat doctor`** CLI tool that performs exhaustive health checks, verifying environment variables, database latency, and API route integrity in one go.

![Doctor CLI](./client/public/img/doctor.gif)

### Type-Safe Integrity

- **Express 5 + TypeScript**: Modern, strict-type architecture.
- **Zod Validation**: Runtime validation for environment variables and API parameters.
- **Prisma ORM**: Type-safe database queries and automated migrations.

### Performance & Scaling

- **Serverless PostgreSQL**: Hosted on Neon with automated scaling.
- **Graceful Handling**: Integrated `ColdStartLoader` to manage serverless cold starts seamlessly for the user.

---

## Tech Stack

| Layer              | Technologies                                                |
| :----------------- | :---------------------------------------------------------- |
| **Backend**        | Node.js (ESM), Express 5, TypeScript, Prisma, Zod, Helmet   |
| **Frontend**       | React 19, Vite, Tailwind CSS, Framer Motion, React Router 7 |
| **Infrastructure** | PostgreSQL (Neon), Render (IaC via `render.yaml`)           |

---

## Quick Start

```bash
# Clone the repository
git clone git@github.com:tlxq/kingerMeat.git
cd kingerMeat

# Setup Server
cd server && npm install && cp .env.example .env
npx prisma migrate deploy && npx prisma db seed
npm run dev

# Setup Client (in a new terminal)
cd client && npm install && cp .env.example .env
npm run dev
```

---

## Documentation

For a deep dive into the architecture, database modeling, and technical trade-offs, please refer to the full project report in [English](./docs/TECHNICAL_REPORT_EN.md) or [Swedish](./docs/TECHNICAL_REPORT_SV.md).

---

<div align="center">
  <img src="./client/public/img/logo-glitch.gif" width="200" />
</div>
