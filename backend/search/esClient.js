const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: '+=3FBUtnnqcc-*L28NPJ'  // your real password
  }
});

module.exports = esClient;
