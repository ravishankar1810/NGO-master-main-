const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/servex';

mongoose.connect(uri)
  .then(async () => {
    const user = await User.findOne({ email: /sumit/i });
    if (user) {
        console.log(`User Found: ${user.name} (${user.email}) [${user.role}]`);
    } else {
        console.log('User NOT found with "sumit" in email');
    }
    const all = await User.find({}, 'name email role');
    console.log('--- ALL USERS ---');
    all.forEach(u => console.log(`${u.name} | ${u.email} | ${u.role}`));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
