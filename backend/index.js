// backend/index.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const searchRoutes = require('./routes/searchRoutes');
const { Client } = require('@elastic/elasticsearch');
// Ensure the database connection runs
require('./config/db'); 

const app = express();
const PORT = process.env.PORT ||5000;

// Middleware
app.use(cors());// Allow cross-origin requests from React frontend
app.use(express.json()); // To parse JSON request bodies

// ✅ Elasticsearch connection check
const esClient = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: '+=3FBUtnnqcc-*L28NPJ'  // <-- replace with your actual password
  }
});

esClient.info()
  .then(() => console.log('✅ Connected to Elasticsearch'))
  .catch(err => console.error('❌ Elasticsearch connection error:', err.message));

  
// Routes'
// ✅ Mount Elasticsearch search route
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send('Auth API is running.');
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

