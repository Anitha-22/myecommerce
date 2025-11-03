const db = require('./config/db'); // Your database connection
const productsData = require('./data/initialProducts');

/**
 * Main function to insert products into the MySQL table.
 */
async function insertProducts() {
    console.log('--- Starting Product Data Insertion ---');

    // Step 1: Fetch all categories and create a name-to-ID map
    const categoryMap = await getCategoryMap();

    if (Object.keys(categoryMap).length === 0) {
        console.error("ERROR: No categories found in the database. Please insert categories first!");
        db.end();
        return;
    }

    // Step 2: Iterate and Insert Products
    const productQuery = 'INSERT INTO products (name, mrp_price, discount_price, quantity, category_id) VALUES (?, ?, ?, ?, ?)';
    let productsInserted = 0;
    
    // We'll use a Promise-based approach to handle the loop and connection closing cleanly
    const promises = productsData.map(product => {
        return new Promise((resolve, reject) => {
            const categoryId = categoryMap[product.category_name];

            if (!categoryId) {
                console.error(`Skipping product: ${product.name}. Category '${product.category_name}' not found.`);
                return resolve(); // Resolve without inserting
            }

            const values = [
                product.name,
                product.mrp_price,
                product.discount_price,
                product.quantity,
                categoryId // The crucial foreign key
            ];

            db.query(productQuery, values, (err, result) => {
                if (err) {
                    // Handle potential duplicate product names or other SQL errors
                    if (err.code === 'ER_DUP_ENTRY') {
                         console.warn(`Warning: Duplicate product entry skipped: ${product.name}`);
                    } else {
                        console.error(`Error inserting product ${product.name}:`, err);
                    }
                    return resolve(); // Still resolve to keep the process going
                }
                productsInserted++;
                console.log(`+ Inserted: ${product.name} (Cat ID: ${categoryId})`);
                resolve();
            });
        });
    });

    // Wait for all insertion promises to complete
    await Promise.all(promises);

    console.log(`\n--- Finished. Total products inserted: ${productsInserted} ---`);
    db.end(); // Close the database connection once all work is done
}

/**
 * Helper function to fetch category names and IDs.
 */
function getCategoryMap() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, name FROM categories';
        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching categories for mapping:', err);
                return reject(err);
            }

            const map = {};
            results.forEach(row => {
                map[row.name] = row.id;
            });
            resolve(map);
        });
    });
}

// Execute the main function
insertProducts();