const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper to get token
const getToken = () => localStorage.getItem('token');

// Generic request handler
async function request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Attach token if exists
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    };

    // Verify token validity
    if (token && typeof token === 'string') {
        // Remove any whitespace/newlines which cause "String did not match expected pattern"
        const cleanToken = token.trim();
        if (cleanToken) {
            headers['Authorization'] = `Bearer ${cleanToken}`;
        }
    }

    console.log(`API Request to ${url}`, {
        token: token ? (token.substring(0, 10) + '...') : 'Missing',
        headers
    }); // DEBUG LOG

    const config: RequestInit = {
        headers,
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            // Handle 401 Unauthorized (invalid token) by clearing token
            if (response.status === 401) {
                localStorage.removeItem('token');
                // Dispatch event to notify AuthContext
                window.dispatchEvent(new Event('auth:logout'));
            }
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Auth API
export const authAPI = {
    login: (credentials) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    register: (userData) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),
    getMe: () => request('/auth/me'),
    updateProfile: (data) => request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
};

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
    delete: async (id: string) => {
        const res = await request(`/expenses/${id}`, {
            method: 'DELETE',
        });
        return res;
    },
    deleteAll: async () => {
        const res = await request('/expenses/all', {
            method: 'DELETE',
        });
        return res;
    },
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
    auth: authAPI,
    expenses: expensesAPI,
    roomRents: roomRentsAPI,
    history: historyAPI,
};
