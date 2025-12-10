import db from '../config/database.js';

console.log('Database initialized successfully!');
console.log('Tables created:');
console.log('  - expenses');
console.log('  - room_rents');
console.log('  - budget_history');

// Close database connection
db.close();
