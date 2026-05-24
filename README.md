# ⚡ TaskFlow — Team Task Manager

A full-stack Team Task Management Web Application built with React, Node.js, Express, and MongoDB. Think of it as a simplified version of Trello or Asana — where teams can create projects, assign tasks, and track progress in real time.

---

## 🌐 Live Demo

- **Frontend:** https://illustrious-inspiration-production-80d7.up.railway.app
- **Backend API:** https://team-task-manager-production-686a.up.railway.app

---

## 🚀 Features

- **User Authentication** — Signup and Login with JWT-based secure sessions
- **Project Management** — Create projects, add/remove members with role control
- **Role-Based Access** — Admin (full control) and Member (view & update assigned tasks only)
- **Task Management** — Create tasks with Title, Description, Due Date, Priority and Status
- **Kanban Board** — Visualize tasks across To Do / In Progress / Done columns
- **Dashboard** — Total tasks, tasks by status, tasks per user, overdue tasks
- **Light & Dark Theme** — Toggle between light and dark mode
- **Fully Deployed** — Live on Railway with MongoDB Atlas cloud database

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 19, React Router v7, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (NoSQL) with Mongoose ODM |
| Authentication | JWT (JSON Web Tokens) + bcryptjs |
| Styling | Custom CSS with CSS Variables |
| Deployment | Railway (Frontend + Backend) |
| Database Hosting | MongoDB Atlas |
| Version Control | GitHub |

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── User.js          # User schema
│   │   │   ├── Project.js       # Project schema
│   │   │   └── Task.js          # Task schema
│   │   ├── routes/
│   │   │   ├── auth.js          # Signup, Login routes
│   │   │   ├── projects.js      # Project CRUD + member management
│   │   │   ├── tasks.js         # Task CRUD + status updates
│   │   │   └── dashboard.js     # Analytics and stats routes
│   │   └── index.js             # Express app entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/
│   │   │   ├── Auth.js
│   │   │   ├── ProjectList.js
│   │   │   ├── ProjectDetail.js
│   │   │   └── Dashboard.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── App.css
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## ⚙️ Local Setup & Installation

### Prerequisites
- Node.js v20+ installed
- MongoDB Atlas account (free tier)
- Git installed

### 1. Clone the Repository

```bash
git clone https://github.com/Adimehta10/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the backend server:

```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm start
```

Frontend runs on: `http://localhost:3000`

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Projects
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/projects` | Get all user projects | Private |
| POST | `/api/projects` | Create new project | Private |
| GET | `/api/projects/:id` | Get single project | Private |
| POST | `/api/projects/:id/members` | Add member by email | Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Admin |
| DELETE | `/api/projects/:id` | Delete project | Admin |

### Tasks
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tasks/project/:projectId` | Get all tasks | Private |
| POST | `/api/tasks` | Create new task | Admin |
| PUT | `/api/tasks/:id` | Update task | Admin/Member |
| DELETE | `/api/tasks/:id` | Delete task | Admin |

### Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/:projectId` | Get project analytics | Private |

---

## 🚢 Deployment on Railway

Both services are deployed on **Railway** from the same GitHub repository.

### Backend Service
- **Root Directory:** `backend`
- **Start Command:** `npm start`
- **Environment Variables:** Set in Railway dashboard

### Frontend Service
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npx serve -s build -l 3000`
- **Environment Variable:** `REACT_APP_API_URL` = live backend URL

---

## 👤 Role Permissions

| Feature | Admin | Member |
|---------|-------|--------|
| Create tasks | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| Update any task | ✅ | ❌ |
| Update assigned task status | ✅ | ✅ |
| Add/Remove members | ✅ | ❌ |
| View dashboard | ✅ | ✅ |
| View all tasks | ✅ | ✅ |
| Delete project | ✅ | ❌ |

---

## 🗄️ Database Schema

### User
```
name: String (required)
email: String (required, unique)
password: String (hashed with bcryptjs)
timestamps: createdAt, updatedAt
```

### Project
```
name: String (required)
description: String
admin: ObjectId → User
members: [{ user: ObjectId → User, role: Admin|Member }]
timestamps: createdAt, updatedAt
```

### Task
```
title: String (required)
description: String
dueDate: Date
priority: Low | Medium | High
status: To Do | In Progress | Done
project: ObjectId → Project
assignedTo: ObjectId → User
createdBy: ObjectId → User
timestamps: createdAt, updatedAt
```

---

## 👨‍💻 Author

**Aditya Mehta**
- GitHub: [@Adimehta10](https://github.com/Adimehta10)

---

## 📄 License

This project is built as part of a Full-Stack Development Assessment.