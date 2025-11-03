// backend/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const { searchProducts } = require('../search/searchController');

router.get('/', searchProducts);

module.exports = router;
