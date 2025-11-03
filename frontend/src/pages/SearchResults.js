// frontend/src/pages/SearchResults.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Pagination from '../components/Pagination';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchInfo, setSearchInfo] = useState({
        total: 0,
        currentPage: 1,
        totalPages: 1,
        priceFilters: {}
    });
    
    const query = searchParams.get('q') || '';
    const currentPage = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) {
                setLoading(false);
                setProducts([]);
                return;
            }

            try {
                setLoading(true);
                setError('');
                
                const response = await axios.get(
                    `http://localhost:5000/api/search?q=${encodeURIComponent(query)}&page=${currentPage}&limit=12`
                );
                
                setProducts(response.data.products);
                setSearchInfo({
                    total: response.data.total,
                    currentPage: response.data.currentPage,
                    totalPages: response.data.totalPages,
                    priceFilters: response.data.priceFilters || {}
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching search results:", err);
                setError('Failed to fetch search results. Please try again.');
                setLoading(false);
                setProducts([]);
            }
        };

        fetchSearchResults();
    }, [query, currentPage]);

    const handlePageChange = (newPage) => {
        navigate(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
    };

    const getPriceFilterText = () => {
        const { minPrice, maxPrice } = searchInfo.priceFilters;
        if (minPrice && maxPrice) {
            return `Price: ₹${minPrice} - ₹${maxPrice}`;
        } else if (minPrice) {
            return `Price: Above ₹${minPrice}`;
        } else if (maxPrice) {
            return `Price: Below ₹${maxPrice}`;
        }
        return '';
    };

    return (
        <div className="search-results-page" style={{ padding: '20px' }}>
            <h2>Search Results for: "{query}"</h2>
            
            {/* Show applied price filters */}
            {getPriceFilterText() && (
                <div style={{ 
                    backgroundColor: '#e8f4fd', 
                    padding: '10px', 
                    borderRadius: '5px', 
                    margin: '10px 0',
                    border: '1px solid #b6d7e8'
                }}>
                    <strong>💰 Price Filter Applied:</strong> {getPriceFilterText()}
                </div>
            )}
            
            {error && (
                <div style={{ color: 'red', margin: '10px 0' }}>
                    {error}
                </div>
            )}
            
            {loading ? (
                <p>Loading products...</p>
            ) : (
                <>
                    <p>{searchInfo.total} product(s) found.</p>
                    
                    <div className="product-list" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                        gap: '20px', 
                        marginTop: '20px' 
                    }}>
                        {products.length > 0 ? (
                            products.map(product => (
                                <div key={product.id} className="product-card" style={{ 
                                    border: '1px solid #ddd', 
                                    padding: '15px', 
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{product.name}</h3>
                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                        <strong>Category:</strong> {product.category_name}
                                    </p>
                                    <p style={{ margin: '5px 0', color: '#888', textDecoration: 'line-through' }}>
                                        <strong>MRP:</strong> ₹{product.mrp_price}
                                    </p>
                                    <p style={{ margin: '5px 0', color: '#e74c3c', fontSize: '1.1em', fontWeight: 'bold' }}>
                                        <strong>Discount Price:</strong> ₹{product.discount_price}
                                    </p>
                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                        <strong>Quantity:</strong> {product.quantity}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>No products matched your search criteria.</p>
                        )}
                    </div>
                    
                    {products.length > 0 && (
                        <Pagination 
                            currentPage={searchInfo.currentPage} 
                            totalPages={searchInfo.totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResults;