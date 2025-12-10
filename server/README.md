# Budget Tracker Backend API

A RESTful API backend for the Daily Budget Tracker application, built with Node.js, Express, and SQLite.

## Features

- **Expense Management**: Create, read, update, and delete daily expenses
- **Room Rent Tracking**: Manage monthly room rent entries
- **Budget History**: Automatic monthly archiving of budget data
- **SQLite Database**: Lightweight, file-based database with zero configuration
- **Input Validation**: Request validation using express-validator
- **CORS Enabled**: Ready for frontend integration

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

The default configuration:
```env
PORT=3001
DB_PATH=./data/budget.db
NODE_ENV=development
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Expenses
- `GET /api/expenses` - Get all expenses for the current month
- `GET /api/expenses/:id` - Get a specific expense
- `POST /api/expenses` - Create a new expense
  ```json
  {
    "date": "2024-12-09",
    "item": "Lunch",
    "cost": 25.50,
    "description": "Optional description"
  }
  ```
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense

### Room Rents
- `GET /api/room-rents` - Get all room rents for the current month
- `GET /api/room-rents/:id` - Get a specific room rent
- `POST /api/room-rents` - Create a new room rent entry
  ```json
  {
    "date": "2024-12-01",
    "cost": 1500.00,
    "item": "Room Rent",
    "description": "Optional description"
  }
  ```
- `PUT /api/room-rents/:id` - Update a room rent
- `DELETE /api/room-rents/:id` - Delete a room rent

### Budget History
- `GET /api/history` - Get all archived monthly summaries
- `GET /api/history/:month` - Get detailed history for a specific month (format: YYYY-MM)
- `POST /api/history/archive` - Archive the current or specified month
  ```json
  {
    "month": "2024-11"
  }
  ```
- `DELETE /api/history/:month` - Delete archived history

## Database

The application uses SQLite with the following schema:

### Tables

**expenses**
- `id` (INTEGER PRIMARY KEY)
- `date` (TEXT) - ISO date format
- `item` (TEXT) - Expense item name
- `cost` (REAL) - Cost amount
- `description` (TEXT) - Optional description
- `created_at` (TEXT) - Timestamp
- `updated_at` (TEXT) - Timestamp

**room_rents**
- Same structure as expenses table

**budget_history**
- `id` (INTEGER PRIMARY KEY)
- `month` (TEXT UNIQUE) - Format: YYYY-MM
- `meals_total` (REAL)
- `others_total` (REAL)
- `monthly_total` (REAL)
- `total_days` (INTEGER)
- `average_meals_total` (REAL)
- `expenses_json` (TEXT) - JSON array of all expenses
- `created_at` (TEXT)

## Project Structure

```
server/
├── config/
│   └── database.js       # Database configuration
├── models/
│   ├── Expense.js        # Expense model
│   ├── RoomRent.js       # Room rent model
│   └── BudgetHistory.js  # Budget history model
├── routes/
│   ├── expenses.js       # Expense routes
│   ├── roomRents.js      # Room rent routes
│   └── history.js        # History routes
├── scripts/
│   └── initDb.js         # Database initialization
├── data/                 # SQLite database files (auto-created)
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── server.js             # Main server file
└── README.md
```

## Testing the API

You can test the API using:

1. **cURL**:
```bash
# Health check
curl http://localhost:3001/api/health

# Get all expenses
curl http://localhost:3001/api/expenses

# Create an expense
curl -X POST http://localhost:3001/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-12-09","item":"Lunch","cost":25.50}'
```

2. **Postman** or **Insomnia**: Import the endpoints and test interactively

3. **Browser**: Visit `http://localhost:3001` to see available endpoints

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include descriptive messages:
```json
{
  "error": "Expense not found"
}
```

Validation errors include detailed information:
```json
{
  "errors": [
    {
      "msg": "Valid date is required",
      "param": "date"
    }
  ]
}
```

## Deployment

### Local Deployment
The server is ready to run locally using the instructions above.

### Production Deployment
For production deployment on platforms like Heroku, Railway, or Render:

1. Ensure `NODE_ENV=production` in environment variables
2. The database will be stored in the `data/` directory
3. For persistent storage on cloud platforms, consider using a volume mount or switching to PostgreSQL

## License

ISC
