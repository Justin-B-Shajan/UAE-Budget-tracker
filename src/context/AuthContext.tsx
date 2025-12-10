import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

export interface User {
    id: number;
    username: string;
    monthly_budget: number;
    created_at: string;
}

export interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to decode JWT payload safely
const decodeToken = (token: string): { userId: number } | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    // Initialize user with ID from token if possible
    const [user, setUser] = useState<User | null>(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decoded = decodeToken(storedToken);
            if (decoded && decoded.userId) {
                return {
                    id: decoded.userId,
                    username: 'Loading...',
                    monthly_budget: 0,
                    created_at: new Date().toISOString()
                };
            }
        }
        return null;
    });

    const isAuthenticated = !!token;

    useEffect(() => {
        // Listen for 401 logout events from api.ts
        const handleLogout = () => logout();
        window.addEventListener('auth:logout', handleLogout);

        if (token) {
            localStorage.setItem('token', token);

            // If user is null but token exists, try to decode again to enable queries immediately
            if (!user) {
                const decoded = decodeToken(token);
                if (decoded && decoded.userId) {
                    setUser({
                        id: decoded.userId,
                        username: 'Loading...',
                        monthly_budget: 0,
                        created_at: new Date().toISOString()
                    });
                }
            }

            // Fetch full user details from server
            authAPI.getMe()
                .then(data => {
                    setUser(data);
                })
                .catch(err => {
                    console.error('Failed to fetch user:', err);
                    // If 401, logout
                    if (err.message.includes('401')) {
                        logout();
                    }
                });
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }

        return () => {
            window.removeEventListener('auth:logout', handleLogout);
        };
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setUser(null); // Clear user on logout
        window.location.href = '/login';
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
