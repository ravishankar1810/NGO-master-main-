const cron = require('node-cron');
const ItemListing = require('../models/ItemListing');

// Run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const result = await ItemListing.updateMany(
      { 
        status: 'Available', 
        expiryAt: { $lt: now } 
      },
      { 
        $set: { status: 'Expired' } 
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`Auto-expired ${result.modifiedCount} listings.`);
    }
  } catch (error) {
    console.error('Expiry Job Error:', error);
  }
});

console.log('Listing Expiry Job initialized (Hourly)');
