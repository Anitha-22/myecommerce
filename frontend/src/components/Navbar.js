// frontend/src/components/Navbar.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';

const Navbar = ({ handleLogout }) => {
    // Only need categories for the search datalist, so keep the fetch logic minimal
    
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();


    // Handle Search Submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.logo}>
                <Link to="/" style={styles.link}>MyEcom</Link>
            </div>
            
            {/* SEARCH BAR */}
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-button">Search</button>
            </form>

            <div style={styles.navLinks}>
                
                {/* 1. ADD ALL PRODUCTS LINK */}
                <Link to="/products" style={styles.link}>
                    All Products
                </Link>

                {/* Logout Button */}
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

// ... (Keep your existing styles or add new ones)

// Basic Inline Styles (You should use a CSS file for production)
const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#333',
        color: 'white',
    },
    logo: {
        fontSize: '1.5em',
        fontWeight: 'bold',
    },
    link: {
        color: 'white',
        textDecoration: 'none',
        margin: '0 10px',
    },
    searchForm: {
        display: 'flex',
        alignItems: 'center',
    },
    searchInput: {
        padding: '8px',
        border: 'none',
        borderRadius: '4px 0 0 4px',
        width: '300px',
    },
    searchButton: {
        padding: '8px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '0 4px 4px 0',
        cursor: 'pointer',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
    },
    categoriesTitle: {
        marginRight: '10px',
        fontWeight: 'normal',
        fontSize: '0.9em'
    },
    categoryLinks: {
        display: 'flex',
        marginRight: '20px',
    },
    logoutButton: {
        padding: '8px 15px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    }
};


export default Navbar;