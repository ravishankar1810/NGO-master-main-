const mongoose = require('mongoose');
require('dotenv').config();
const Campaign = require('./models/Campaign');

async function fixCompleted() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Find all active campaigns where raisedAmount >= targetAmount
  const toComplete = await Campaign.find({
    status: 'active',
    $expr: { $gte: ['$raisedAmount', '$targetAmount'] }
  });

  console.log(`Found ${toComplete.length} campaigns that have met their target but are still marked 'active'`);
  toComplete.forEach(c => console.log(` - "${c.title}" | Raised: ${c.raisedAmount} / Target: ${c.targetAmount}`));

  if (toComplete.length > 0) {
    const ids = toComplete.map(c => c._id);
    const result = await Campaign.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'completed' } }
    );
    console.log(`✅ Updated ${result.modifiedCount} campaigns to 'completed'`);
  }

  process.exit(0);
}

fixCompleted().catch(err => { console.error(err); process.exit(1); });
