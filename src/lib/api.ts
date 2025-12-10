const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic request handler
async function request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Expense API
export const expensesAPI = {
    getAll: () => request('/expenses'),
    getById: (id) => request(`/expenses/${id}`),
    create: (expenseData) => request('/expenses', {
        method: 'POST',
        body: JSON.stringify(expenseData),
    }),
    update: (id, expenseData) => request(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
    }),
    delete: (id) => request(`/expenses/${id}`, {
        method: 'DELETE',
    }),
};

// Room Rent API
export const roomRentsAPI = {
    getAll: () => request('/room-rents'),
    getById: (id) => request(`/room-rents/${id}`),
    create: (rentData) => request('/room-rents', {
        method: 'POST',
        body: JSON.stringify(rentData),
    }),
    update: (id, rentData) => request(`/room-rents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(rentData),
    }),
    delete: (id) => request(`/room-rents/${id}`, {
        method: 'DELETE',
    }),
};

// Budget History API
export const historyAPI = {
    getAll: () => request('/history'),
    getByMonth: (month) => request(`/history/${month}`),
    archive: (month) => request('/history/archive', {
        method: 'POST',
        body: JSON.stringify({ month }),
    }),
    delete: (month) => request(`/history/${month}`, {
        method: 'DELETE',
    }),
};

export default {
    expenses: expensesAPI,
    roomRents: roomRentsAPI,
    history: historyAPI,
};
