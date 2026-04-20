const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ItemListing = require('./backend/models/ItemListing');
const User = require('./backend/models/User');

dotenv.config({ path: './backend/.env' });

async function seedItems() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  // Find a donor
  const donor = await User.findOne({ role: 'donor' });
  if (!donor) {
    console.log("No donor found to create items.");
    process.exit(0);
  }

  // Clear existing to avoid duplicates if any
  await ItemListing.deleteMany({});

  const items = [
    {
      donorId: donor._id,
      category: 'food',
      quantity: '50 packets',
      description: 'Rice, lentils, and basic spices pre-packaged.',
      recipients: ['homeless', 'migrants'],
      tone: 'urgent',
      pickupInfo: 'Can drop it off anywhere in South Delhi.',
      city: 'Delhi',
      aiPrompt: '50 emergency food ration kits ready for immediate distribution. Essential grains for those displaced. NGOs operating urgent feeding drives, please respond to coordinate drop-off.',
      status: 'Available'
    },
    {
      donorId: donor._id,
      category: 'books',
      quantity: '200 books',
      description: 'High school science and math textbooks in pristine condition.',
      recipients: ['children'],
      tone: 'warm',
      pickupInfo: 'School library in Bandra.',
      city: 'Mumbai',
      aiPrompt: 'A massive collection of 200 science and math academic texts looking for eager minds. Perfect for after-school programs or rural learning centers. Empower the next generation!',
      status: 'Available'
    },
    {
      donorId: donor._id,
      category: 'medicine',
      quantity: '100 kits',
      description: 'Basic first-aid kits and over-the-counter painkillers.',
      recipients: ['elderly', 'flood victims'],
      tone: 'simple',
      pickupInfo: 'Pharmacy pickup in Koramangala.',
      city: 'Bangalore',
      aiPrompt: '100 brand new first-aid stabilization kits available. Crucial for elderly care facilities or remote camps. Ready for immediate collection.',
      status: 'Available'
    }
  ];

  await ItemListing.insertMany(items);
  console.log("Seeded 3 ItemListings successfully.");
  process.exit(0);
}

seedItems();
