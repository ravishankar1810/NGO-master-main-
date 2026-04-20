const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/servex';
console.log('Testing connection to:', uri);

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Success! Connected to MongoDB.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to connect:', err.message);
    process.exit(1);
  });
