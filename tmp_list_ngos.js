const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

async function listNGOs() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/servex');
        const ngos = await User.find({ role: 'ngo' }).select('name email');
        console.log(JSON.stringify(ngos, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listNGOs();
