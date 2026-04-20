const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const User = require('./models/User');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/servex';

mongoose.connect(uri)
  .then(async () => {
    const donations = await Donation.find({}, 'donorId amount createdAt');
    const users = await User.find({}, '_id name email role');
    
    console.log(`FOUND ${users.length} USERS`);
    console.log(`FOUND ${donations.length} DONATIONS`);
    
    users.forEach(u => {
      const uDonations = donations.filter(d => d.donorId.toString() === u._id.toString());
      console.log(`User: ${u.name} (${u.email}) [${u._id}] - Donations: ${uDonations.length}`);
    });
    
    const orphanDonations = donations.filter(d => !users.find(u => u._id.toString() === d.donorId.toString()));
    console.log(`\nORPHAN DONATIONS (no matching user): ${orphanDonations.length}`);
    orphanDonations.forEach(d => console.log(`- DonorId: ${d.donorId} Amount: ${d.amount}`));

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
