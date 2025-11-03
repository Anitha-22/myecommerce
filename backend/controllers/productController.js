// backend/controllers/productController.js
// Debug the error while retrieving data from database
const db = require('../config/db');

// --- 1. Get All Categories (with Pagination) ---
const getCategories = (req, res) => {
    // Default values if parameters are missing
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; // 10 categories per page
    const offset = (page - 1) * limit;

    const dataQuery = 'SELECT id, name, description FROM categories LIMIT ? OFFSET ?';
    const countQuery = 'SELECT COUNT(*) AS total FROM categories';

    db.query(countQuery, (err, countResult) => {
        if (err) {
            console.error('Count Fetch Error:', err);
            return res.status(500).json({ message: 'Error fetching category count.' });
        }
        
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        db.query(dataQuery, [limit, offset], (err, categories) => {
            if (err) {
                console.error('Category Fetch Error:', err);
                return res.status(500).json({ message: 'Error fetching categories.' });
            }
            
            res.json({
                categories,
                currentPage: page,
                totalPages,
                totalItems
            });
        });
    });
};

// --- 2. Get All Products (with Pagination) ---
const getAllProducts = (req, res) => {
    // Default values
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // 12 products per page
    const offset = (page - 1) * limit;

    const dataQuery = 'SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id LIMIT ? OFFSET ?';
    const countQuery = 'SELECT COUNT(*) AS total FROM products';

    db.query(countQuery, (err, countResult) => {
        if (err) {
            console.error('Count Fetch Error:', err);
            return res.status(500).json({ message: 'Error fetching product count.' });
        }
        
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        db.query(dataQuery, [limit, offset], (err, products) => {
            if (err) {
                console.error('All Products Fetch Error:', err);
                return res.status(500).json({ message: 'Error fetching all products.' });
            }
            
            res.json({
                products,
                currentPage: page,
                totalPages,
                totalItems
            });
        });
    });
};

// --- 3. Get Products by Category (with Pagination) ---
const getProductsByCategory = (req, res) => {
    const categoryId = req.params.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; 
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) AS total FROM products WHERE category_id = ?';
    
    const dataQuery = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        JOIN categories c ON p.category_id = c.id
        WHERE p.category_id = ? 
        LIMIT ? OFFSET ?
    `;

    db.query(countQuery, [categoryId], (err, countResult) => {
        if (err) {
            console.error('Category Count Error:', err);
            return res.status(500).json({ message: 'Error fetching product count by category.' });
        }
        
        
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        db.query(dataQuery, [categoryId, limit, offset], (err, products) => {
            if (err) {
                console.error('Category Products Fetch Error:', err);
                return res.status(500).json({ message: 'Error fetching category products.' });
            }
            
            res.json({
                products,
                currentPage: page,
                totalPages,
                totalItems,
                limit
            });
        });
    });
};

// --- 4. Get Single Product by ID ---
const getProductById = (req, res) => {
    const productId = req.params.productId; 

    const query = `
        SELECT 
            p.id, p.name, p.mrp_price, p.discount_price, p.quantity, 
            c.name AS category_name, c.id AS category_id
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    `;

    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Product by ID Fetch Error:', err);
            return res.status(500).json({ message: 'Error fetching product details.' });
        }
        
        const product = results[0];

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.json(product);
    });
};

// --- 5. Search Products (by name/description) with Pagination ---
// --- 5. Search Products (by name/description/category/price) with Pagination ---
const searchProducts = (req, res) => {
    const searchTerm = req.query.q; // e.g., "highweight jeans under 2000"
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;
    
    if (!searchTerm) {
        return res.status(400).json({ message: "Search query 'q' is required." });
    }
    
    // Pattern used for LIKE comparison (e.g., %highweight jeans under 2000%)
    const searchPattern = `%${searchTerm}%`; 
    
    // --- Dynamic Query Building ---
    let priceLimit = null;
    
    // Attempt to find a number (of at least 2 digits) in the search term for price filtering
    const priceMatch = searchTerm.match(/(\d{2,}(?:\.\d+)?)/); 

    if (priceMatch) {
        // Take the first number found as the intended price limit
        priceLimit = parseFloat(priceMatch[0]);
    }

    // 1. Define the base WHERE clause for keyword/category matching (Always required)
    let baseWhereClause = `
        WHERE 
            (p.name LIKE ? OR 
 c.name LIKE ?)

    `;
    
    // 2. Define the parameters for the base clause
    // let baseQueryParams = [searchPattern, searchPattern, searchPattern];

    // 3. Add price filter if a price was detected
    if (priceLimit) {
        // We use AND to ensure keyword results are ALSO filtered by price
        baseWhereClause += ' AND p.discount_price <= ?';
        baseQueryParams.push(priceLimit);
        console.log(`DEBUG: Price limit detected: ${priceLimit}`); // Debug log
    }

    // --- Query 1: Get total count matching the search term ---
    const countQuery = `
        SELECT COUNT(p.id) AS total 
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ${baseWhereClause}
    `;
    
    // --- Query 2: Get the paginated search results ---
    const dataQuery = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        JOIN categories c ON p.category_id = c.id
        ${baseWhereClause}
        LIMIT ? OFFSET ?
    `;

    // Final parameters for data query: Base parameters + limit + offset
    const dataParams = baseQueryParams.concat([limit, offset]);

    db.query(countQuery, baseQueryParams, (err, countResult) => {
        if (err) {
            console.error('Search Count Error:', err);
            return res.status(500).json({ message: 'Error fetching search count.' });
        }
        
        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        db.query(dataQuery, dataParams, (err, products) => {
            if (err) {
                console.error('Search Products Fetch Error:', err);
                return res.status(500).json({ message: 'Error fetching search products.' });
            }
            
            res.json({
                products,
                currentPage: page,
                totalPages,
                totalItems,
                searchTerm
            });
        });
    });
};

// --- 6. Admin Functions (Adding data) ---
const addCategory = (req, res) => {
    const { name, description } = req.body;
    
    if (!name || !description) {
        return res.status(400).json({ message: 'Category name and description are required.' });
    }

    const query = 'INSERT INTO categories (name, description) VALUES (?, ?)';
    db.query(query, [name, description], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'Category already exists.' });
            }
            console.error('Add Category Error:', err);
            return res.status(500).json({ message: 'Database error while adding category.' });
        }
        res.status(201).json({ message: 'Category added successfully.', categoryId: result.insertId });
    });
};

// In your productController.js - update the addProduct function
const addProduct = async (req, res) => {
    const { name, mrp_price, discount_price, quantity, category_id, category_name } = req.body;

    if (!name || !mrp_price || !discount_price || !quantity || !category_id) {
        return res.status(400).json({ message: 'All product fields are required.' });
    }

    const query = `
        INSERT INTO products (name, mrp_price, discount_price, quantity, category_id) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [name, mrp_price, discount_price, quantity, category_id];

    db.query(query, values, async (err, result) => {
        if (err) {
            console.error('Add Product Error:', err);
            return res.status(500).json({ message: 'Database error while adding product.' });
        }

        const productId = result.insertId;

        try {
            // Get category name for better search
            const categoryQuery = 'SELECT name FROM categories WHERE id = ?';
            db.query(categoryQuery, [category_id], async (categoryErr, categoryResult) => {
                if (categoryErr) {
                    console.error('Category fetch error:', categoryErr);
                    return;
                }

                const categoryName = categoryResult[0]?.name || 'Unknown';

                // Index in Elasticsearch with all searchable fields
                await esClient.index({
                    index: 'products',
                    id: productId.toString(),
                    body: {
                        name: name,
                        mrp_price: parseFloat(mrp_price),
                        discount_price: parseFloat(discount_price),
                        quantity: parseInt(quantity),
                        category_id: parseInt(category_id),
                        category_name: categoryName // Important for search
                    }
                });

                await esClient.indices.refresh({ index: 'products' });
                console.log(`✅ Product indexed in Elasticsearch (ID: ${productId})`);
            });

        } catch (esError) {
            console.error('❌ Elasticsearch Index Error:', esError);
        }

        res.status(201).json({ 
            message: 'Product added successfully.', 
            productId: productId 
        });
    });
};

// --- FINAL EXPORT ---
module.exports = { 
    getCategories, 
    getAllProducts, 
    getProductsByCategory, 
    getProductById, 
    searchProducts, // Included the new function
    addCategory, 
    addProduct 
};