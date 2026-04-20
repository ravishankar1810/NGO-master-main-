const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Donation = require('./backend/models/Donation');
require('dotenv').config({ path: './backend/.env' });

async function inspect() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/servex');
        const user = await User.findOne({ email: /sumit/i });
        if (!user) {
            console.log("No user found with email matching 'sumit'");
            process.exit(1);
        }
        
        console.log(`User Found: ${user.name} (${user.email}) ID: ${user._id}`);
        
        const donations = await Donation.find({ donorId: user._id }).populate('campaignId');
        console.log(`Found ${donations.length} donations.`);
        
        const summary = donations.map(d => ({
            id: d._id,
            amount: d.amount,
            method: d.paymentMethod,
            campaign: d.campaignId ? d.campaignId.title : 'General Fund',
            category: d.campaignId ? d.campaignId.category : 'N/A',
            date: d.createdAt
        }));
        
        console.log(JSON.stringify(summary, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect();
