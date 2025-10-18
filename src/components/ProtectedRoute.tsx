import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { currentUser, isLoading } = useAuth();

    // While the app is checking the user's authentication state, 
    // display a loading message. This prevents a flicker or premature redirect.
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                Loading...
            </div>
        );
    }

    // If the check is complete and there is no user, redirect to the login page.
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // If the check is complete and a user is logged in, render the requested component (e.g., the Dashboard).
    return <>{children}</>;
};

export default ProtectedRoute;

