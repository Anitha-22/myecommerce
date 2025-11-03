// backend/scripts/bulkIndexProducts.js
const db = require('../config/db');
const esClient = require('../search/esClient');

async function bulkIndexProducts() {
    try {
        console.log('🔄 Starting bulk indexing...');
        
        // First, ensure the index exists
        const indexExists = await esClient.indices.exists({ index: 'products' });
        if (!indexExists) {
            console.log('❌ Products index does not exist. Please run createProductsIndex.js first.');
            return;
        }

        console.log('✅ Products index exists');
        
        // Fetch all products with category names
        const query = `
            SELECT 
                p.id,
                p.name, 
                p.mrp_price, 
                p.discount_price, 
                p.quantity, 
                p.category_id,
                c.name as category_name
            FROM products p 
            JOIN categories c ON p.category_id = c.id
        `;
        
        console.log('📥 Fetching products from database...');
        
        db.query(query, async (err, products) => {
            if (err) {
                console.error('❌ Database error:', err.message);
                return;
            }

            console.log(`📥 Found ${products.length} products in database`);

            if (products.length === 0) {
                console.log('ℹ️  No products found in database. Please add products first.');
                return;
            }

            // Show sample data
            console.log('📋 First product sample:');
            console.log(products[0]);

            // Prepare bulk operations
            const body = [];
            products.forEach(product => {
                body.push({ 
                    index: { 
                        _index: 'products', 
                        _id: product.id.toString() 
                    } 
                });
                
                body.push({
                    name: product.name || '',
                    mrp_price: parseFloat(product.mrp_price) || 0,
                    discount_price: parseFloat(product.discount_price) || 0,
                    quantity: parseInt(product.quantity) || 0,
                    category_id: parseInt(product.category_id) || 0,
                    category_name: product.category_name || ''
                });
            });

            console.log(`📤 Preparing to index ${products.length} products...`);
            console.log(`📦 Bulk operations prepared: ${body.length} items (${body.length / 2} documents)`);

            try {
                // Execute bulk operation
                const response = await esClient.bulk({ 
                    refresh: true, 
                    body 
                });

                console.log('✅ Bulk operation completed');
                console.log('📊 Response structure:', Object.keys(response));

                // The response structure has the data at root level, not in .body
                if (response.errors) {
                    console.error('❌ Bulk operation contained errors:');
                    
                    const failedItems = response.items.filter(item => item.index.error);
                    console.log(`❌ Failed: ${failedItems.length} documents`);
                    
                    if (failedItems.length > 0) {
                        // Show first 3 errors
                        failedItems.slice(0, 3).forEach((item, index) => {
                            console.log(`  ${index + 1}. ID: ${item.index._id}`);
                            console.log(`     Error: ${item.index.error.reason}`);
                        });
                    }

                    const successfulItems = response.items.filter(item => !item.index.error);
                    console.log(`✅ Successful: ${successfulItems.length} documents`);
                    
                } else {
                    console.log(`✅ All ${products.length} documents indexed successfully!`);
                }

                console.log(`⏱️  Bulk operation took: ${response.took}ms`);

                // Count total documents in index
                try {
                    const countResponse = await esClient.count({ index: 'products' });
                    console.log(`📈 Total documents in Elasticsearch: ${countResponse.count}`);
                } catch (countError) {
                    console.error('❌ Error counting documents:', countError.message);
                }

                // Test search with a small sample
                try {
                    console.log('\n🎯 Testing search functionality...');
                    const testResult = await esClient.search({
                        index: 'products',
                        body: {
                            size: 5,
                            query: { match_all: {} }
                        }
                    });

                    console.log('📝 Sample indexed products:');
                    testResult.hits.hits.forEach((hit, index) => {
                        console.log(`  ${index + 1}. ${hit._source.name} - ${hit._source.category_name} - ₹${hit._source.discount_price}`);
                    });

                    // Test search for specific terms
                    console.log('\n🔍 Testing search for "Apparel"...');
                    const searchTest = await esClient.search({
                        index: 'products',
                        body: {
                            size: 5,
                            query: {
                                multi_match: {
                                    query: "Apparel",
                                    fields: ["name", "category_name"]
                                }
                            }
                        }
                    });
                    
                    console.log(`📊 Found ${searchTest.hits.total.value} products for "Apparel":`);
                    if (searchTest.hits.total.value > 0) {
                        searchTest.hits.hits.forEach((hit, index) => {
                            console.log(`  ${index + 1}. ${hit._source.name} - ₹${hit._source.discount_price}`);
                        });
                    }

                    // Test search for "Winter" 
                    console.log('\n🔍 Testing search for "Winter"...');
                    const winterTest = await esClient.search({
                        index: 'products',
                        body: {
                            size: 5,
                            query: {
                                multi_match: {
                                    query: "Winter",
                                    fields: ["name", "category_name"]
                                }
                            }
                        }
                    });
                    
                    console.log(`📊 Found ${winterTest.hits.total.value} products for "Winter":`);
                    if (winterTest.hits.total.value > 0) {
                        winterTest.hits.hits.forEach((hit, index) => {
                            console.log(`  ${index + 1}. ${hit._source.name} - ${hit._source.category_name} - ₹${hit._source.discount_price}`);
                        });
                    }

                } catch (testError) {
                    console.error('❌ Error during search test:', testError.message);
                }

            } catch (bulkError) {
                console.error('❌ Bulk indexing failed:');
                console.error('Error message:', bulkError.message);
                
                if (bulkError.meta) {
                    console.error('Meta information:', bulkError.meta);
                }
            }
            
            process.exit();
        });

    } catch (error) {
        console.error('❌ Outer error in bulk indexing:', error.message);
        process.exit(1);
    }
}

bulkIndexProducts();