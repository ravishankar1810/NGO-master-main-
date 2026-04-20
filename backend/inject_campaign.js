const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Campaign = require('./models/Campaign');

async function injectData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ngo-db');
    console.log('Connected to MongoDB');

    // 1. Create a Test NGO
    let ngo = await User.findOne({ email: 'testngo@example.com' });
    if (!ngo) {
      ngo = await User.create({
        name: 'Help Kerala Foundation',
        email: 'testngo@example.com',
        password: 'password123',
        role: 'ngo',
        isVerified: true
      });
      console.log('Created Test NGO');
    }

    // 2. Create a Test Campaign
    const campaign = await Campaign.create({
      title: 'Support Flood Recovery in Wayanad',
      description: 'Urgent help needed for rebuilding homes.',
      targetAmount: 500000,
      raisedAmount: 125000,
      category: 'disaster',
      ngoId: ngo._id,
      status: 'active',
      location: {
        city: 'Wayanad',
        state: 'Kerala',
        coordinates: [76.132, 11.685] // [lng, lat]
      },
      coverImage: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800'
    });
    console.log('Created Test Campaign:', campaign.title);

    process.exit(0);
  } catch (err) {
    console.error('Injection error:', err);
    process.exit(1);
  }
}

injectData();
