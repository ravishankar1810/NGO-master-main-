const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const User = require('./models/User');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/servex';

const SUMIT_EMAIL = 'sumitrajslm2018@gmail.com';
const TEST_ACCOUNT_ID = '69c0ee4c93d966e63c7dad3d';

mongoose.connect(uri)
  .then(async () => {
    const sumit = await User.findOne({ email: SUMIT_EMAIL });
    if (!sumit) {
      console.error(`❌ User ${SUMIT_EMAIL} not found!`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${sumit.name} (${sumit._id})`);

    const result = await Donation.updateMany(
      { donorId: TEST_ACCOUNT_ID },
      { $set: { donorId: sumit._id } }
    );

    console.log(`✅ Updated ${result.modifiedCount} donations.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error during maintenance:', err.message);
    process.exit(1);
  });
