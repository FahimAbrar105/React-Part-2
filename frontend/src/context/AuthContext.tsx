import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    studentId?: string;
    contactNumber?: string;
    isVerified: boolean;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    axios.defaults.withCredentials = true;
    // We'll set base URL in a global config or env, but for now assumption:
    axios.defaults.baseURL = 'http://localhost:5000'; // Adjust port if needed

    const checkUser = async () => {
        try {
            const res = await axios.get('/auth/me');
            setUser(res.data.user);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await axios.post('/auth/login', { email, password });
        if (res.data.user) {
            setUser(res.data.user);
        }
        return res.data;
    };

    const logout = async () => {
        try {
            await axios.get('/auth/logout');
            setUser(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkUser }}>
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
