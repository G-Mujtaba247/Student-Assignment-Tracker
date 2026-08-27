# Student Assignment Tracker

A full-stack assignment tracker with separate student and administrator workflows.

## Features

- Register and sign in with JWT authentication
- Create, edit, filter, sort, and delete assignments
- Switch between list and Kanban board views
- Start and submit student work
- Administrator dashboard for managing assignments and users
- Rate-limited authentication endpoints

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB connection string

## Setup

Install all dependencies from the repository root:

```powershell
npm run install-all
```

Create the server environment file:

```powershell
Copy-Item server/.env.example server/.env
```

Create the client environment file only when the API is not available through the Vite proxy:

```powershell
Copy-Item client/.env.example client/.env
```

Update `server/.env` with a strong `JWT_SECRET` and your MongoDB connection string. The optional demo credentials can be set there as well.

## Run In Development

Start both the API and Vite development server:

```powershell
npm run dev
```

Or start them separately:

```powershell
npm run server
npm run client
```

The client runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

## Production Build

Build the client from the repository root:

```powershell
npm run build
```

The generated client files are written to `client/dist`.

## Environment Variables

Server variables are documented in `server/.env.example`. The client supports `VITE_API_BASE_URL`; by default it uses `/api`, which is proxied to the local server by Vite.

Never commit `.env` files or real credentials. They are excluded by `.gitignore`.
