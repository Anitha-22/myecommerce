// frontend/src/pages/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = () => {
    // Get the productId from the URL (e.g., /product/1)
    const { productId } = useParams(); 
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Call the new backend endpoint: /api/products/:productId
                const res = await axios.get(`http://localhost:5000/api/products/${productId}`);
                setProduct(res.data);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.response?.data?.message || 'Failed to load product details.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]); // Re-fetch if productId in the URL changes

    if (loading) return <div>Loading product details...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (!product) return <div>No product found.</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd' }}>
            <h2>{product.name}</h2>
            
            <p style={{ color: 'gray' }}>Category: **{product.category_name}**</p>

            <div style={{ fontSize: '1.2em', margin: '15px 0' }}>
                <p>MRP: <s style={{ color: 'darkgray' }}>${product.mrp_price.toFixed(2)}</s></p>
                <p style={{ fontWeight: 'bold', color: '#dc3545' }}>Discount Price: ${product.discount_price.toFixed(2)}</p>
            </div>
            
            <p>In Stock: **{product.quantity}** units</p>
            
            <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
                Add to Cart
            </button>
        </div>
    );
};

export default ProductDetail;