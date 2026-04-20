const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/servex';

mongoose.connect(uri)
  .then(async () => {
    const users = await User.find({}, 'name email role');
    console.log('--- REGISTERED USERS ---');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) [${u.role}]`);
    });
    console.log('------------------------');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
