# Daily Budget Tracker - Full Stack Application

A modern expense tracking application with a React frontend and Node.js/Express backend.

## Project Structure

```
chromacraft-ui-main/
├── server/              # Backend API server
│   ├── config/          # Database configuration
│   ├── models/          # Data models (Expense, RoomRent, BudgetHistory)
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   └── server.js        # Main server file
├── src/                 # Frontend React app
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # API client and utilities
│   └── pages/           # Page components
└── README.md            # This file
```

## Features

### Frontend
- **Modern React UI** with TypeScript, Vite, and shadcn-ui components
- **Real-time Data Synchronization** using React Query
- **Expense Tracking** for meals and other daily expenses
- **Room Rent Management** with due date tracking
- **Budget History** with monthly archiving and detailed reports
- **Responsive Design** with Tailwind CSS

### Backend
- **RESTful API** built with Express.js
- **SQLite Database** for lightweight data persistence
- **Input Validation** using express-validator
- **CORS Enabled** for frontend integration
- **Automatic Schema Initialization**

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional, uses defaults):
```bash
cp .env.example .env
```

4. Start the backend server:
```bash
# Development mode (recommended)
npm run dev

# Or production mode
npm start
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate back to the project root:
```bash
cd ..
```

2. Install frontend dependencies (if not already done):
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

The default `.env` should contain:
```
VITE_API_URL=http://localhost:3001/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Running Both Servers

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash  
npm run dev
```

Then open `http://localhost:5173` in your browser!

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Expenses
- `GET /expenses` - Get all expenses for current month
- `POST /expenses` - Create new expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

#### Room Rents
- `GET /room-rents` - Get all room rents for current month
- `POST /room-rents` - Create new room rent
- `PUT /room-rents/:id` - Update room rent
- `DELETE /room-rents/:id` - Delete room rent

#### Budget History
- `GET /history` - Get all archived months
- `GET /history/:month` - Get specific month details (format: YYYY-MM)
- `POST /history/archive` - Archive a month

See [server/README.md](server/README.md) for complete API documentation.

## Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Components**: shadcn-ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack React Query
- **Form Handling**: React Hook Form
- **Routing**: React Router
- **Validation**: Zod

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (via sql.js)
- **Validation**: express-validator
- **CORS**: cors middleware

## Architecture

### Data Flow

1. **User Interaction** → React components
2. **Action Triggered** → React Query hooks
3. **API Request** → API client (`src/lib/api.ts`)
4. **Backend Processing** → Express routes
5. **Database Operation** → SQLite models
6. **Response** → JSON data
7. **Cache Update** → React Query automatically refreshes UI

### State Management

- **Server State**: Managed by React Query with automatic caching and synchronization
- **Local State**: React hooks for UI state
- **No localStorage**: All data persists in the SQLite database

## Development

### Adding New Endpoints

1. Create route handler in `server/routes/`
2. Add method to appropriate model in `server/models/`
3. Mount route in `server/server.js`
4. Add API method to `src/lib/api.ts`
5. Create React Query hook in `src/hooks/`
6. Use hook in component

### Database Schema

The SQLite database includes three tables:

- **expenses**: Daily expense entries
- **room_rents**: Monthly room rent tracking
- **budget_history**: Archived monthly summaries with full expense data

See `server/config/database.js` for complete schema.

## Deployment

### Backend Deployment

The backend can be deployed to:
- **Heroku**: Add Procfile with `web: node server/server.js`
- **Railway**: Deploy directly from the server directory
- **Render**: Configure as a Node.js web service
- **Vercel**: Use serverless functions (requires modifications)

### Frontend Deployment

```bash
npm run build
```

Deploy the `dist/` folder to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

**Important**: Update `VITE_API_URL` in production environment to point to your deployed backend URL.

## Troubleshooting

### Backend won't start
- Ensure port 3001 is not in use
- Check Node.js version (v18+)
- Delete `server/node_modules` and run `npm install` again

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check `.env` file has correct API URL
- Look for CORS errors in browser console

### Database errors
- The database file is created automatically in `server/data/`
- If corrupted, delete `server/data/budget.db` and restart server

## Migration from localStorage

If you have existing data in localStorage from the old version:

1. Export your data before switching to the backend version
2. The old download feature can still be used to backup expenses
3. Manually re-create important entries after backend is running
4. Or create a migration script to POST data to the API endpoints

## License

ISC

## Contributing

Feel free to submit issues and pull requests!
