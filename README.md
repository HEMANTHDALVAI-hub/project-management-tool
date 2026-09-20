# TASKFLOW — Full-Stack SaaS Project Management Tool

> **Tagline:** *"Plan better. Work together. Get things done."*

TASKFLOW is a professional full-stack project management web application inspired by Trello and Asana. Built as part of **CodeAlpha Internship Task 3**, it provides real-time collaboration, drag-and-drop Kanban boards, subtask checklists, task comment threads, activity streams, calendar scheduling, dark mode support, and JWT authentication.

---

## 🌟 Key Features

1. **Authentication & Security**
   - Secure Registration and Login with bcrypt password hashing and JWT token storage.
   - Demo User auto-login (`demo@taskflow.com` / `Demo@12345`).
   - Forgot password simulation flow.
   - Role-based permissions (`OWNER`, `ADMIN`, `MEMBER`).

2. **Real-Time Collaboration (Socket.IO)**
   - Instant broadcasting of task movements, creations, updates, and comment feeds.
   - "● Live" connection indicator badge in top navigation bar.

3. **Interactive Drag & Drop Kanban Board**
   - Columns: `To Do`, `In Progress`, `Review`, `Done`.
   - Smooth drag and drop task movement using `@hello-pangea/dnd`.
   - Real-time column counter badges and task priority indicators.

4. **Task Management & Checklists**
   - Detailed task views with subtask checklists and completion progress bars.
   - Priority levels: `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
   - Custom tags and labels filtering.
   - Task due dates with overdue highlighting.

5. **Real-time Comments & Activity Streams**
   - Comment threads per task with author avatars and relative time ago formatting.
   - Chronological project activity audit stream.

6. **Dashboard & Analytics**
   - Overview widgets for Total Projects, Assigned Tasks, Completed Tasks, and Overdue items.
   - Individual progress bars per project.

7. **Calendar & My Tasks View**
   - Dedicated My Tasks view categorized into Overdue, Today, Upcoming, and Completed.
   - Visual monthly calendar displaying scheduled tasks by due dates.

8. **Theme & Responsive Design**
   - Professional SaaS dark and light mode toggle with `localStorage` persistence.
   - Fully responsive layout with collapsible sidebar and touch-friendly controls.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router v6, `@hello-pangea/dnd`, Lucide React Icons, Axios, Socket.IO Client.
- **Backend**: Node.js, Express.js, Socket.IO, Jsonwebtoken, Bcryptjs, Mongoose.
- **Database**: MongoDB (Mongoose schemas) with seamless **mongodb-memory-server** fallback for out-of-the-box local execution.

---

## 📁 Project Structure

```
taskflow/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # Kanban, Modals, Navbar, Sidebar, Toast
│   │   ├── context/            # AuthContext, SocketContext, ThemeContext
│   │   ├── pages/              # Landing, Login, Register, Dashboard, Board, etc.
│   │   ├── services/           # Axios API Client services
│   │   ├── utils/              # Date formatters
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js + Express + Socket.IO Backend
│   ├── config/                 # MongoDB & Memory Server DB setup
│   ├── controllers/            # Auth, Project, Task, Comment, Notification controllers
│   ├── middleware/             # Auth & Error middlewares
│   ├── models/                 # User, Project, Task, Comment, Notification, Activity models
│   ├── routes/                 # Express API routes
│   ├── socket/                 # Socket.IO room and event handlers
│   ├── utils/                  # Auto Data Seeder
│   ├── server.js
│   └── package.json
├── .env.example
├── package.json                # Root package for concurrent launcher
└── README.md
```

---

## 🔑 Demo Account Credentials

For quick evaluation without manual registration, click the **"Instant Demo Login"** button on the Login page or use:

- **Email**: `demo@taskflow.com`
- **Password**: `Demo@12345`

---

## 🚀 Installation & Running Locally

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Step 1: Install All Dependencies
From the project root directory, run:
```bash
npm run install:all
```
*(This automatically runs `npm install` in the root, `server/`, and `client/` directories).*

### Step 2: Start Client & Server Concurrently
Run:
```bash
npm run dev
```

This will launch:
- **Backend Express & Socket.IO Server**: `http://localhost:5000`
- **Frontend Vite Application**: `http://localhost:5173`

---

## 📡 API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Yes |
| `GET` | `/api/projects` | List projects for user | Yes |
| `POST` | `/api/projects` | Create a new project | Yes |
| `GET` | `/api/projects/:id` | Fetch project details & tasks | Yes |
| `GET` | `/api/tasks` | Get tasks (filter by project/assignee) | Yes |
| `POST` | `/api/tasks` | Create task | Yes |
| `PUT` | `/api/tasks/:id` | Update task status/checklist | Yes |
| `GET` | `/api/tasks/:id/comments`| Get task comment thread | Yes |
| `POST` | `/api/tasks/:id/comments`| Post a comment | Yes |
| `GET` | `/api/notifications` | Fetch user notification inbox | Yes |

---

## ⚡ Socket.IO Real-time Events

- **Client Joins Room**: `join:project` (`project:${id}`) & `join:user` (`user:${id}`)
- **Emitted Server Events**:
  - `task:created`
  - `task:updated`
  - `task:deleted`
  - `comment:added`
  - `notification:new`

---

## 📜 License

Created for **CodeAlpha Internship Task 3 — Project Management Tool**.
