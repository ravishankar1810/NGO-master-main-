const mongoose = require('mongoose');
const User = require('./models/User');
const Donation = require('./models/Donation');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/servex';

mongoose.connect(uri)
  .then(async () => {
    const users = await User.find({$or: [{email: /sumit/i}, {name: /sumit/i}]});
    console.log('--- USERS MATCHING "sumit" ---');
    users.forEach(u => console.log(`${u._id} | ${u.name} | ${u.email}`));
    
    const donations = await Donation.find();
    console.log('\n--- ALL DONATIONS ---');
    donations.forEach(d => console.log(`Donation ID: ${d._id} | DonorId: ${d.donorId} | Amount: ${d.amount}`));
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
