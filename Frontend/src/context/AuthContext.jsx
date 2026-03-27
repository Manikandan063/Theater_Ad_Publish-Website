import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // In a real app, verify the token with the backend
            // Here we just decode basic info or use what we saved
            const savedUser = JSON.parse(localStorage.getItem('user'));
            if (savedUser) setUser(savedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, [token]);

    const getEndpointPath = (role) => {
        if (role === 'theaterOwner' || role === 'admin') return 'theater-owners';
        if (role === 'adSeller') return 'ad-sellers';
        if (role === 'thirdParty') return 'third-parties';
        return role;
    };

    const login = async (email, password, role) => {
        try {
            // Determine the endpoint based on role selected in form
            const endpoint = `http://localhost:5000/api/${getEndpointPath(role)}/login`;
            const response = await axios.post(endpoint, { email, password });
            
            const { token: newToken, data } = response.data;
            
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify({ ...data, role }));
            
            setToken(newToken);
            setUser({ ...data, role });
            
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (userData, role) => {
        try {
            const endpoint = `http://localhost:5000/api/${getEndpointPath(role)}/register`;
            const response = await axios.post(endpoint, userData);
            
            const { token: newToken, data } = response.data;
            
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify({ ...data, role }));
            
            setToken(newToken);
            setUser({ ...data, role });
            
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
