import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        // Redirect to their respective dashboard
        const dashboard = user.role === 'admin' ? '/admin' : 
                         user.role === 'theaterOwner' ? '/theater-owner' : 
                         user.role === 'adSeller' ? '/ad-seller' : '/third-party';
        return <Navigate to={dashboard} replace />;
    }

    return children;
};

export default PrivateRoute;
