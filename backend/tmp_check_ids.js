const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const User = require('./models/User');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/servex';

mongoose.connect(uri)
  .then(async () => {
    const donations = await Donation.find({}, 'donorId amount createdAt');
    const users = await User.find({}, '_id name email role');
    
    console.log('--- USERS ---');
    users.forEach(u => console.log(`${u._id} | ${u.role} | ${u.name} | ${u.email}`));
    
    console.log('\n--- DONATIONS ---');
    donations.forEach(d => console.log(`${d.donorId} | ${d.amount} | ${d.createdAt}`));
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
