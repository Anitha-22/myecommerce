// backend/search/searchController.js
const esClient = require('./esClient');
// connect this file to backend to elasticsearch
const INDEX_NAME = 'products';

exports.searchProducts = async (req, res) => {
    try {
        const userQuery = req.query.q || ''; 
        const page = parseInt(req.query.page) || 1;
        
        const limit = parseInt(req.query.limit) || 12;
        
        const offset = (page - 1) * limit;
        

        console.log('🔍 Search request:', { userQuery, page, limit });

        if (!userQuery.trim()) {
            return res.status(400).json({ 
                error: "Search query 'q' is required." 
            });
        }

        let minPrice = null;
        let maxPrice = null;
        let textQuery = userQuery;

        // Parse price filters
        const abovePriceRegex = /(?:above|over|more than|min|greater than)\s*(\d+(?:\.\d+)?)/i;
        const belowPriceRegex = /(?:below|under|less than|upto|max)\s*(\d+(?:\.\d+)?)/i;
        
        const aboveMatch = userQuery.match(abovePriceRegex);
        if (aboveMatch) {
            minPrice = parseFloat(aboveMatch[1]);
            textQuery = textQuery.replace(abovePriceRegex, '').trim();
        }
        
        const belowMatch = userQuery.match(belowPriceRegex);
        if (belowMatch) {
            maxPrice = parseFloat(belowMatch[1]);
            textQuery = textQuery.replace(belowPriceRegex, '').trim();
        }

        console.log('📝 Parsed query:', { textQuery, minPrice, maxPrice });

        // FIXED: Build a much smarter search query
        const esQueryBody = {
            query: {
                bool: {
                    should: [ // Use "should" with boosting for better relevance
                        // 1. EXACT PHRASE MATCH (highest priority)
                        {
                            match_phrase: {
                                name: {
                                    query: textQuery,
                                    boost: 10
                                }
                            }
                        },
                        // 2. ALL WORDS MUST MATCH in name (high priority)
                        {
                            bool: {
                                must: {
                                    multi_match: {
                                        query: textQuery,
                                        fields: ["name^4"],
                                        type: "cross_fields",
                                        operator: "and" // ALL words must be present
                                    }
                                },
                                boost: 5
                            }
                        },
                        // 3. ALL WORDS in category (medium priority)
                        {
                            bool: {
                                must: {
                                    multi_match: {
                                        query: textQuery,
                                        fields: ["category_name^3"],
                                        type: "cross_fields", 
                                        operator: "and"
                                    }
                                },
                                boost: 3
                            }
                        },
                        // 4. SOME WORDS match with AND operator (lower priority)
                        {
                            multi_match: {
                                query: textQuery,
                                fields: ["name^2", "category_name^1"],
                                type: "best_fields",
                                operator: "and",
                                fuzziness: 1, // LIMITED fuzziness
                                boost: 1
                            }
                        }
                    ],
                    minimum_should_match: 1, // At least one should clause must match
                    filter: []
                }
            },
            from: offset,
            size: limit,
            min_score: 0.5 // Set minimum score to filter out very weak matches
        };

        // Add price range filter
        const priceRange = {};
        if (minPrice) priceRange.gte = minPrice;
        if (maxPrice) priceRange.lte = maxPrice;
        
        if (Object.keys(priceRange).length > 0) {
            esQueryBody.query.bool.filter.push({
                range: { discount_price: priceRange }
            });
        }

        console.log('🎯 Elasticsearch query:', JSON.stringify(esQueryBody.query, null, 2));

        const result = await esClient.search({
            index: INDEX_NAME,
            body: esQueryBody
        });

        console.log('✅ Search successful, found:', result.hits.total.value);

        // Debug: Log what matched
        if (result.hits.total.value > 0) {
            console.log('🔍 Top matches with scores:');
            result.hits.hits.slice(0, 5).forEach((hit, index) => {
                console.log(`  ${index + 1}. "${hit._source.name}" - Score: ${hit._score}`);
                console.log(`     Category: ${hit._source.category_name}, Price: ${hit._source.discount_price}`);
            });
        }

        const products = result.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source
        }));

        res.json({
            query: userQuery,
            products: products,
            total: result.hits.total.value,
            currentPage: page,
            totalPages: Math.ceil(result.hits.total.value / limit),
            searchTerm: userQuery,
            priceFilters: {
                minPrice: minPrice,
                maxPrice: maxPrice
            }
        });

    } catch (error) {
        console.error('❌ Elasticsearch Search Error:', error);
        res.status(500).json({ 
            error: 'Search failed', 
            details: error.message 
        });
    }
};