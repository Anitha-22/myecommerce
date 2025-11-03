// backend/routes/productRoutes.js
const express = require('express');
const { getCategories, getProductsByCategory, getAllProducts ,getProductById,addCategory, addProduct,} = require('../controllers/productController');
const router = express.Router();
const productController = require('../controllers/productController');

// Route to get categories for the homepage/search bar





router.get('/categories', productController.getCategories); 

// Route to get all products (for the Navbar button)
router.get('/', productController.getAllProducts);


// Route to get products for a specific category
router.get('/category/:categoryId', productController.getProductsByCategory); 

router.get('/:productId', productController.getProductById);


// backend/routes/ProductRoutes.js (The problem route)





module.exports = router;