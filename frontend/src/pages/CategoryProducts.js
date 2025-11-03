// frontend/src/pages/CategoryProducts.js (Full code update)

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate ,Link} from 'react-router-dom';
import axios from 'axios';
import Pagination from '../components/Pagination'; // Assuming you import Pagination
import { formatIndianRupee } from '../utils/currency';

const PRODUCTS_PER_PAGE = 12; // Same limit as All Products

const CategoryProducts = () => {
    const { categoryId } = useParams();
    const [productsData, setProductsData] = useState({ products: [], totalPages: 1, currentPage: 1, totalItems: 0 });
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get page number from the URL or default to 1
    const currentPage = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        setLoading(true);
        const fetchCategoryProducts = async () => {
            try {
                // Pass categoryId, page, and limit
                const url = `http://localhost:5000/api/products/category/${categoryId}?page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`;
                const res = await axios.get(url);
                setProductsData(res.data);
                
            } catch (error) {
                console.error('Error fetching category products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryProducts();
    }, [categoryId, currentPage]); // Re-run when category or page changes

    // Handler to change the page
    const handlePageChange = (newPage) => {
        // Navigate while preserving the categoryId parameter
        navigate(`/category/${categoryId}?page=${newPage}`);
    };

    if (loading) return <div>Loading products for category {categoryId}...</div>;
    if (!productsData.products || productsData.products.length === 0) {
        return <div>No products found in this category.</div>;
    }
    if (productsData.products.length === 0) return <div>No products found in this category.</div>;
    
    const categoryName = productsData.products[0]?.category_name || 'Category';

    return (
        <div>
            <h2>📚 Products in: {categoryName} ({productsData.totalItems} items)</h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {productsData.products.map(p => (
                <div key={p.id} style={productStyles.card}>
                    {/* 1. PRODUCT NAME */}
                    <h3 style={productStyles.name}>{p.name}</h3>

                    {/* 2. MRP PRICE (Strikethrough) */}
                    <p>
                        MRP: 
                        <span style={productStyles.mrpPrice}>
                            {formatIndianRupee(p.mrp_price)} 
                        </span>
                    </p>

                    {/* 3. DISCOUNT PRICE (Bold & Red) */}
                    <p style={productStyles.discountPrice}>
                        Price: **{formatIndianRupee(p.discount_price)}**
                    </p>
                    
                    {/* 4. QUANTITY */}
                    <p style={productStyles.quantity}>
                        Quantity: **{p.quantity}**
                    </p>
                    
                    {/* Link to Product Detail Page (Example) */}
                    <Link to={`/product/${p.id}`} style={productStyles.link}>View Details</Link>
                </div>
            ))}
        </div>
            
            <Pagination 
                currentPage={productsData.currentPage} 
                totalPages={productsData.totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};
const productStyles = {
    card: {
        border: '1px solid #ddd',
        padding: '15px',
        width: '250px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    name: {
        fontSize: '1.2em',
        marginBottom: '10px',
    },
    mrpPrice: {
        textDecoration: 'line-through',
        color: '#888',
        marginLeft: '5px',
    },
    discountPrice: {
        fontWeight: 'bold',
        color: '#c0392b', // Red
        fontSize: '1.1em',
    },
    quantity: {
        fontSize: '0.9em',
        color: '#3498db', // Blue
    },
    link: {
        display: 'block',
        marginTop: '10px',
        textAlign: 'center',
        textDecoration: 'none',
        color: '#2980b9',
    }
};

export default CategoryProducts;