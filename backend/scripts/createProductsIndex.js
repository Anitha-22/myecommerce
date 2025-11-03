// backend/scripts/createProductsIndex.js
const esClient = require('../search/esClient'); // or your esClient path

async function createProductsIndex() {
    try {
        console.log('🔄 Creating products index...');

        // Check if index exists and delete if it does
        const indexExists = await esClient.indices.exists({ index: 'products' });
        if (indexExists) {
            console.log('🗑️  Index exists, deleting...');
            await esClient.indices.delete({ index: 'products' });
        }

        // Create index with proper mappings
        const { body } = await esClient.indices.create({
            index: 'products',
            body: {
                mappings: {
                    properties: {
                        name: {
                            type: 'text',
                            fields: {
                                keyword: {
                                    type: 'keyword'
                                }
                            }
                        },
                        mrp_price: {
                            type: 'float'
                        },
                        discount_price: {
                            type: 'float'
                        },
                        quantity: {
                            type: 'integer'
                        },
                        category_id: {
                            type: 'integer'
                        },
                        category_name: {
                            type: 'text',
                            fields: {
                                keyword: {
                                    type: 'keyword'
                                }
                            }
                        },
                        description: {
                            type: 'text'
                        }
                    }
                },
                settings: {
                    analysis: {
                        analyzer: {
                            default: {
                                type: 'standard'
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Products index created successfully!');
        
        // Verify the index was created
        const newIndexExists = await esClient.indices.exists({ index: 'products' });
        console.log('📊 Index verification:', newIndexExists ? '✅ EXISTS' : '❌ MISSING');

        return body;
    } catch (error) {
        console.error('❌ Error creating index:', error);
        if (error.meta && error.meta.body) {
            console.error('Error details:', error.meta.body.error);
        }
    }
}

createProductsIndex();