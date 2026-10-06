# 🚀 CodeAlpha Project Management Tool

A full-stack modern Project Management Web Application (similar to a mini Trello / Asana) built with the **MERN Stack** (MongoDB, Express.js, React.js with Vite, Node.js) for the **CodeAlpha Full Stack Development Internship**.

---

## 🌟 Key Features

1. **User Authentication & Authorization**:
   - Secure User Registration and Login using JWT (JSON Web Tokens) and bcrypt password hashing.
   - Protected routes and session management with auto-logout on token expiration.
   - Demo credentials one-click autofill for quick evaluation.

2. **Project Management**:
   - Create, view, update, and delete projects.
   - Multi-user collaborative projects with member invitation system.
   - Filter and search projects dynamically.

3. **Kanban Board & Workflow**:
   - Trello-style 3-column Kanban board (**Todo**, **In Progress**, **Done**).
   - Fast status transitions with direct directional controls.
   - Filter board tasks by assigned team member or view unassigned items.

4. **Task Lifecycle Management**:
   - Create tasks with Title, Description, Priority (**Low**, **Medium**, **High**), Due Date, and Assignee.
   - Full task detail editing and task deletion.
   - Real-time status sync across views.

5. **Collaboration & Discussion**:
   - Interactive comments system inside every task.
   - Chronological message history with author stamps and timestamps.

6. **Analytics & Dashboard**:
   - High-level overview of projects and task metrics (Total Projects, Tasks Todo, In Progress, Completed).
   - Visual progress bar showing completion percentage.
   - Recent tasks and recent projects quick access feeds.

7. **User Profile**:
   - Account overview and personal task queue displaying all items assigned directly to the logged-in user.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios with request/response interceptors
- **Icons**: Lucide React
- **Styling**: Modern, responsive CSS design system (Dark mode aesthetic, CSS variables, glassmorphism, responsive grid)

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **CORS & Environment**: `cors` and `dotenv`

---

## 📁 Project Folder Structure

```text
CodeAlpha_Project_Management_Tool/
├── client/                     # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PriorityBadge.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/            # Auth context & state
│   │   │   └── AuthContext.jsx
│   │   ├── pages/              # Application pages
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ProjectBoardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── TaskDetailPage.jsx
│   │   ├── services/           # Axios API configuration
│   │   │   └── api.js
│   │   ├── App.jsx             # Routes & route protection
│   │   ├── index.css           # Design system & styles
│   │   └── main.jsx            # Application entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API (Node + Express)
│   ├── src/
│   │   ├── config/             # Database connection
│   │   │   └── db.js
│   │   ├── controllers/        # Request handling logic
│   │   │   ├── authController.js
│   │   │   ├── commentController.js
│   │   │   ├── projectController.js
│   │   │   └── taskController.js
│   │   ├── middleware/         # JWT verification middleware
│   │   │   └── auth.js
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── Comment.js
│   │   │   ├── Project.js
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   └── routes/             # API routing
│   │       ├── authRoutes.js
│   │       ├── commentRoutes.js
│   │       ├── projectRoutes.js
│   │       └── taskRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express app entry
│
├── .gitignore
├── .env.example
├── package.json                # Root convenience scripts
└── README.md                   # Documentation
```

---

## 📋 Database Models

### 1. User
- `name` (String, required)
- `email` (String, unique, required)
- `password` (String, hashed with bcrypt)
- `timestamps` (`createdAt`, `updatedAt`)

### 2. Project
- `title` (String, required)
- `description` (String)
- `members` (Array of ObjectIds referencing `User`)
- `createdBy` (ObjectId referencing `User`, required)
- `timestamps` (`createdAt`, `updatedAt`)

### 3. Task
- `projectId` (ObjectId referencing `Project`, required)
- `title` (String, required)
- `description` (String)
- `assignedTo` (ObjectId referencing `User`, default null)
- `status` (Enum: `['Todo', 'In Progress', 'Done']`, default: `'Todo'`)
- `priority` (Enum: `['Low', 'Medium', 'High']`, default: `'Medium'`)
- `dueDate` (Date, default null)
- `createdBy` (ObjectId referencing `User`, required)
- `timestamps` (`createdAt`, `updatedAt`)

### 4. Comment
- `taskId` (ObjectId referencing `Task`, required)
- `userId` (ObjectId referencing `User`, required)
- `message` (String, required)
- `timestamps` (`createdAt`, `updatedAt`)

---

## 📡 Backend API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login user & return JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user data | Private |
| `GET` | `/api/auth/users` | List all users (for adding members/assigning) | Private |

### Projects (`/api/projects`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/projects` | Create a new project | Private |
| `GET` | `/api/projects` | Get all projects of logged-in user | Private |
| `GET` | `/api/projects/:id` | Get project details by ID | Private |
| `PUT` | `/api/projects/:id` | Update project title / description | Private |
| `DELETE` | `/api/projects/:id` | Delete project and related tasks/comments | Private |
| `POST` | `/api/projects/:id/members` | Add member to project by ID or email | Private |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/tasks` | Create task inside a project | Private |
| `GET` | `/api/tasks/project/:projectId` | Get all tasks for a project | Private |
| `GET` | `/api/tasks/:id` | Get single task details | Private |
| `PUT` | `/api/tasks/:id` | Update task (status, assignee, priority, etc.) | Private |
| `DELETE` | `/api/tasks/:id` | Delete a task and its comments | Private |
| `GET` | `/api/tasks/dashboard/summary` | Get aggregated project & task metrics | Private |

### Comments (`/api/comments`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/comments` | Post comment on a task | Private |
| `GET` | `/api/comments/task/:taskId` | Get comments thread for a task | Private |

---

## ⚡ Getting Started (Installation & Running)

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

---

### Step 1: Clone Repository & Setup Environment

```bash
git clone https://github.com/<your-username>/CodeAlpha_Project_Management_Tool.git
cd CodeAlpha_Project_Management_Tool
```

#### Server Environment Setup
Navigate to `server/`:
```bash
cd server
copy .env.example .env
```
Ensure your `server/.env` contains:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/codealpha_project_management
JWT_SECRET=super_secret_jwt_key_codealpha_2026
CLIENT_URL=http://localhost:5173
```

#### Client Environment Setup
Navigate to `client/`:
```bash
cd ../client
copy .env.example .env
```
Ensure your `client/.env` contains:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### Step 2: Install Dependencies

From root:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### Step 3: Run the Application

You can start the backend and frontend in two separate terminal windows:

#### Terminal 1: Start Backend Server
From the root directory:
```bash
npm run server
```
*(Or navigate into the server folder: `cd server` then `npm run dev`)*
The server will start at: `http://localhost:5000`

#### Terminal 2: Start Frontend App
From the root directory:
```bash
npm run client
```
*(Or navigate into the client folder: `cd client` then `npm run dev`)*
The client will start at: `http://localhost:5173`

Open your browser and visit: **`http://localhost:5173`**

---

## 🚀 How to Upload to GitHub

Follow these simple steps from the root directory `CodeAlpha_Project_Management_Tool`:

```bash
# 1. Initialize git repository
git init

# 2. Add all files (node_modules and .env are automatically ignored by .gitignore)
git add .

# 3. Create your first commit
git commit -m "feat: complete MERN stack project management tool for CodeAlpha internship"

# 4. Set main branch
git branch -M main

# 5. Add your GitHub repository remote
git remote add origin https://github.com/rajeevkumar-05/CodeAlpha_Project_Management_Tool.git

# 6. Push to GitHub
git push -u origin main
```

---

## 👨‍💻 Internship Submission Details
- **Internship**: CodeAlpha Full Stack Web Development Internship
- **Project**: CodeAlpha_Project_Management_Tool
- **Author**: Full Stack Developer Intern
- **Status**: Completed & Ready for Review
