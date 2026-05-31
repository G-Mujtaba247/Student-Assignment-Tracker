# Student Assignment Tracker

A MERN stack app for tracking student assignments. The project includes:

- `server/`: Express API with MongoDB, authentication, and assignment CRUD.
- `client/`: React + Vite frontend for login/register, assignment creation, updates, and deletion.

## Setup

1. Install dependencies for the backend:

```bash
cd server
npm install
```

2. Install dependencies for the frontend:

```bash
cd ../client
npm install
```

3. Start the backend server:

```bash
cd ../server
npm run dev
```

4. Start the frontend app:

```bash
cd ../client
npm run dev
```

## Environment

Copy `server/.env.example` to `server/.env` and update values if needed.

Required variables:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/student-assignment-tracker
JWT_SECRET=your_jwt_secret_here
```

The frontend uses `http://localhost:5000/api` by default.
