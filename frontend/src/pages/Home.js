// frontend/src/pages/Home.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../components/Pagination'; // Ensure path is correct

const CATEGORIES_PER_PAGE = 8; // Adjust number of categories per page

const Home = () => {
    const [categoryData, setCategoryData] = useState({ categories: [], totalPages: 1, currentPage: 1 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Use 'catPage' parameter for category pagination
    const currentPage = parseInt(searchParams.get('catPage')) || 1; 

    useEffect(() => {
        console.log('Home.js: Starting category fetch for page', currentPage);
        setLoading(true);
        const fetchCategories = async () => {
            try {
                // Fetch categories with pagination parameters
                const res = await axios.get(`http://localhost:5000/api/products/categories?page=${currentPage}&limit=${CATEGORIES_PER_PAGE}`);
                console.log('Home.js: Received Data:', res.data);
                setCategoryData(res.data);
            } catch (error) {
                console.error('Failed to fetch categories for home:', error);
                setCategoryData({ categories: [], totalPages: 1, currentPage: 1 }); // Defensive clear
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [currentPage]); 

    // Handler: When a category is clicked, navigate to its product list
    const handleCategoryClick = (categoryId) => {
        navigate(`/category/${categoryId}`);
    };
    
    // Handler: Changes the category pagination page
    const handlePageChange = (newPage) => {
        // Update the URL search parameter, which re-runs useEffect
       navigate(`/home?catPage=${newPage}`);
    };

    if (loading){
        console.log('Home.js: Still Loading');
        return <div style={styles.container}>Loading product categories...</div>;
    }
    // Defensive check
    if (!categoryData.categories || categoryData.categories.length === 0) {
        console.log('Home.js: No categories to display.');
        return <div style={styles.container}>No categories found.</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Browse All Categories</h2>
            
            <div style={styles.categoryList}>
                {categoryData.categories.map(cat => (
                    <div 
                        key={cat.id} 
                        onClick={() => handleCategoryClick(cat.id)}
                        style={styles.categoryCard}
                    >
                        <h3>{cat.name}</h3>
                        <p>{cat.description}</p>
                    </div>
                ))}
            </div>

            <div style={styles.paginationContainer}>
                <Pagination 
                    currentPage={categoryData.currentPage} 
                    totalPages={categoryData.totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

// Basic Inline Styles for clarity (Use CSS for production)
const styles = {
    container: {
        padding: '30px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
    },
    heading: {
        marginBottom: '30px',
        fontSize: '2em',
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px'
    },
    categoryList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        marginBottom: '40px',
    },
    categoryCard: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        textAlign: 'left',
        minHeight: '150px'
    },
    paginationContainer: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center'
    }
};

export default Home;