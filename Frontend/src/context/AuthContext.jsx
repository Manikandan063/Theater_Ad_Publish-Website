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
            const savedUser = JSON.parse(localStorage.getItem('user'));
            if (savedUser) setUser(savedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Auto-logout on 401 Unauthorized (e.g., deleted users/re-seeded DB)
            const interceptor = axios.interceptors.response.use(
                (response) => response,
                (error) => {
                    if (error.response?.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }
                    return Promise.reject(error);
                }
            );

            setLoading(false);
            return () => {
                axios.interceptors.response.eject(interceptor);
            };
        } else {
            setLoading(false);
        }
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
            const endpoint = `/api/${getEndpointPath(role)}/login`;
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
            const endpoint = `/api/${getEndpointPath(role)}/register`;
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
