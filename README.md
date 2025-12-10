# UAE Budget Tracker 🇦🇪

**Live App:** [uae-budget-tracker.vercel.app](https://uae-budget-tracker.vercel.app)  
**API:** [uae-budget-tracker-production.up.railway.app](https://uae-budget-tracker-production-7da5.up.railway.app)

A modern, full-stack expense tracking application designed for managing daily food budgets, room rents, and monthly archives. Built with React, Node.js, and SQLite.

## 🚀 Key Features

### Frontend (React + Vite)
- **📊 Interactive Dashboard**: Visual summary of daily layouts, meals, and other expenses.
- **🧾 Invoice Generation**: Download detailed monthly expense reports as HTML invoices.
- **🏨 Room Rent Tracking**: Dedicated management for monthly rent and due dates.
- **📅 Monthly Archives**: Archive and review past months' data with detailed breakdowns.
- **📱 Fully Responsive**: Optimized for mobile, tablet, and desktop devices.
- **⚡ Real-time Updates**: Data stays synced using React Query.

### Backend (Node.js + Express)
- **🔐 Secure API**: RESTful endpoints for expenses, room rents, and archives.
- **💾 SQLite Database**: Lightweight, file-based persistence (perfect for portable deployments).
- **🔎 Data Validation**: Robust input validation using `express-validator`.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Node.js, Express.js, SQLite (better-sqlite3)
- **Deployment**: Vercel (Frontend), Railway (Backend)

---

## 🏃‍♂️ Running Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Justin-B-Shajan/UAE-Budget-tracker.git
cd UAE-Budget-tracker
```

### 2. Setup Backend
```bash
cd server
npm install
npm run dev
```
The backend will start on `http://localhost:3001` (or 8080).

### 3. Setup Frontend
Open a new terminal:
```bash
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`.

---

## ☁️ Deployment Architecture

### Backend (Railway)
- The backend is deployed on **Railway**.
- Configuration: `railway.json` ensures dependencies are installed in the `server/` directory.
- Database: Uses SQLite (note: data persists on persistent volumes, but ephemeral on free tier restarts).

### Frontend (Vercel)
- The frontend is deployed on **Vercel**.
- Connects to the backend via `VITE_API_URL` environment variable.

---

## 📄 Documentation & Guides

- **[Deployment Guide](DEPLOYMENT.md)**: Detailed step-by-step instructions for deploying to Railway and Vercel.
- **[Walkthrough](walkthrough.md)**: Details on recent feature implementations (PDF invoice, archiving, etc).

---

## 👨‍💻 Author

**Justin B Shajan**  
[GitHub Profile](https://github.com/Justin-B-Shajan)

---

## 📜 License

This project is licensed under the ISC License.

