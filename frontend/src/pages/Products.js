// frontend/src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../components/Pagination';

const PRODUCTS_PER_PAGE = 12;

const AllProducts = () => {
    const [productsData, setProductsData] = useState({ 
        products: [], 
        totalPages: 1, 
        currentPage: 1,
        totalItems: 0 
    });
    const [loading, setLoading] = useState(true);
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentPage = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        setLoading(true);
        const fetchAllProducts = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/products?page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`);
                console.log('API Response:', res.data); // Debug log
                setProductsData(res.data);
            } catch (error) {
                console.error('Error fetching all products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllProducts();
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        navigate(`/products?page=${newPage}`);
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading all products...</div>;
    
    if (productsData.products.length === 0) return (
        <div style={{ padding: '20px', textAlign: 'center' }}>No products available yet.</div>
    );

    return (
        <div style={{ padding: '20px' }}>
            <h2>🛒 All Products Available ({productsData.totalItems} items)</h2>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '20px', 
                marginTop: '20px' 
            }}>
                {productsData.products.map(p => (
                    <div key={p.id} style={{ 
                        border: '1px solid #ddd', 
                        padding: '15px', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        backgroundColor: 'white'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '1.1em' }}>
                            {p.name}
                        </h3>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>Category:</strong> {p.category_name}
                        </p>
                        <p style={{ margin: '5px 0', color: '#888', textDecoration: 'line-through' }}>
                            <strong>MRP:</strong> ₹{p.mrp_price}
                        </p>
                        <p style={{ margin: '5px 0', color: '#e74c3c', fontSize: '1.2em', fontWeight: 'bold' }}>
                            <strong>Discount Price:</strong> ₹{p.discount_price}
                        </p>
                        <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>Quantity:</strong> {p.quantity}
                        </p>
                        
                        {/* Show savings if available */}
                        {p.mrp_price > p.discount_price && (
                            <p style={{ 
                                margin: '5px 0', 
                                color: '#27ae60', 
                                fontWeight: 'bold',
                                fontSize: '0.9em'
                            }}>
                                You save: ₹{(p.mrp_price - p.discount_price).toFixed(2)}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Pagination Component */}
            <Pagination 
                currentPage={productsData.currentPage} 
                totalPages={productsData.totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default AllProducts;