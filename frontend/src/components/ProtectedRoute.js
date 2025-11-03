// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Component to protect routes requiring authentication.
 * @param {object} props - Component props.
 * @param {string} props.token - The authentication token.
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ token }) => {
    // !!token converts the token string (or null) into a boolean (true/false)
    const isLoggedIn = !!token;

    // If the user is logged in, render the child route component via <Outlet />
    if (isLoggedIn) {
        return <Outlet />;
    }

    // If not logged in, redirect them to the Sign In page
    // The 'replace' prop replaces the current entry in the history stack,
    // preventing the user from hitting the back button to view the restricted page.
    return <Navigate to="/signin" replace />;
};

export default ProtectedRoute;