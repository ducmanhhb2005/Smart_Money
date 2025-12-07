import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import * as api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (formData) => {
        try {
            const { data } = await api.login(formData);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            setUser(data.user);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            alert('Đăng nhập thất bại!');
        }
    }, [navigate]);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    }, [navigate]);

    const value = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        login,
        logout,
    }), [user, login, logout]);

    if (loading) return <div>Loading Application...</div>;

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
