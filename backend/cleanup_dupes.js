const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const Campaign = require('./models/Campaign');
  const User = require('./models/User');

  // 1. Find all real NGO user IDs
  const realNgos = await User.find({ role: 'ngo' }).select('_id');
  const realNgoIds = realNgos.map(n => n._id.toString());
  console.log('Real NGO users found:', realNgoIds.length);

  // 2. Remove campaigns that belong to fake/seeded NGO IDs (not real users)
  const allCamps = await Campaign.find({});
  const orphaned = allCamps.filter(c => !realNgoIds.includes(c.ngoId?.toString()));
  console.log('Orphaned/seeded campaigns to remove:', orphaned.map(c => c.title));

  if (orphaned.length > 0) {
    const orphanedIds = orphaned.map(c => c._id);
    const r1 = await Campaign.deleteMany({ _id: { $in: orphanedIds } });
    console.log('Deleted orphaned campaigns:', r1.deletedCount);
  }

  // 3. For each real NGO, find and remove duplicate campaigns (same title)
  for (const ngoId of realNgoIds) {
    const myCamps = await Campaign.find({ ngoId }).sort({ createdAt: -1 });
    const seen = new Set();
    const dupeIds = [];
    for (const c of myCamps) {
      if (seen.has(c.title)) {
        dupeIds.push(c._id);
      } else {
        seen.add(c.title);
      }
    }
    if (dupeIds.length > 0) {
      const r2 = await Campaign.deleteMany({ _id: { $in: dupeIds } });
      console.log(`Deleted ${r2.deletedCount} duplicate campaigns for NGO ${ngoId}`);
    }
  }

  console.log('Cleanup complete!');
  process.exit(0);
}

cleanup().catch(err => { console.error(err); process.exit(1); });
