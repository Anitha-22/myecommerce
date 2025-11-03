// // frontend/src/components/CategoryBar.js

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import axios from 'axios';
// import Pagination from './Pagination'; // Ensure path is correct

// const CATEGORIES_PER_PAGE = 8; // Adjust based on your preferred design

// const CategoryBar = () => {
//     const [categoryData, setCategoryData] = useState({ categories: [], totalPages: 1, currentPage: 1 });
//     const [loading, setLoading] = useState(true);
//     const navigate = useNavigate();
//     const [searchParams] = useSearchParams();

//     // Use a unique search parameter to manage category pagination
//     const currentPage = parseInt(searchParams.get('catPage')) || 1; 

//     useEffect(() => {
//         setLoading(true);
//         const fetchCategories = async () => {
//             try {
//                 // Fetch categories with pagination parameters
//                 const res = await axios.get(`http://localhost:5000/api/products/categories?page=${currentPage}&limit=${CATEGORIES_PER_PAGE}`);
//                 setCategoryData(res.data);
//             } catch (error) {
//                 console.error('Failed to fetch categories for category bar:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchCategories();
//     }, [currentPage]); 

//     const handleCategoryClick = (categoryId) => {
//         navigate(`/category/${categoryId}`);
//     };
    
//     const handlePageChange = (newPage) => {
//         // Update the URL search parameter, which re-runs useEffect
//         navigate(`/?catPage=${newPage}`); 
//     };

//     if (loading) return <div style={barStyles.loading}>Loading categories...</div>;
//     if (categoryData.categories.length === 0) return null; // Don't show the bar if empty

//     return (
//         <div style={barStyles.container}>
//             <div style={barStyles.categoryList}>
//                 {categoryData.categories.map(cat => (
//                     <div 
//                         key={cat.id} 
//                         onClick={() => handleCategoryClick(cat.id)}
//                         style={barStyles.categoryItem}
//                     >
//                         **{cat.name}**
//                     </div>
//                 ))}
//             </div>
//             <div style={barStyles.paginationContainer}>
//                 <Pagination 
//                     currentPage={categoryData.currentPage} 
//                     totalPages={categoryData.totalPages}
//                     onPageChange={handlePageChange}
//                 />
//             </div>
//         </div>
//     );
// };

// const barStyles = {
//     container: {
//         backgroundColor: '#f8f9fa',
//         borderBottom: '1px solid #ddd',
//         padding: '10px 20px',
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     categoryList: {
//         display: 'flex',
//         flexWrap: 'wrap',
//         gap: '15px',
//     },
//     categoryItem: {
//         padding: '8px 15px',
//         border: '1px solid #ccc',
//         borderRadius: '20px',
//         cursor: 'pointer',
//         backgroundColor: 'white',
//         fontSize: '0.9em',
//         transition: 'background-color 0.2s',
//     },
//     loading: {
//         padding: '10px 20px',
//         textAlign: 'center',
//         backgroundColor: '#f0f0f0'
//     },
//     paginationContainer: {
//         marginLeft: 'auto', // Push pagination to the right
//     }
// };

// export default CategoryBar;