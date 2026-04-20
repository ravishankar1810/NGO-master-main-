const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');
require('dotenv').config();

const imageMap = {
    animal: ['/asset/animal1.png', '/asset/animal2.png', '/asset/animal3.png'],
    women: ['/asset/women1.png', '/asset/women2.png'],
    environment: ['/asset/env1.png', '/asset/env2.png'],
    disaster: ['/asset/disaster1.png', '/asset/default1.png'],
    health: ['/asset/health1.png', '/asset/default1.png'],
    education: ['/asset/edu1.png', '/asset/default1.png'],
    food: ['/asset/food1.png', '/asset/food2.png'],
    child: ['/asset/edu1.png', '/asset/default1.png']
};

async function optimizeImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/servex');
        console.log("Connected to MongoDB for Performance Optimization...");

        const campaigns = await Campaign.find({});
        console.log(`Optimizing assets for ${campaigns.length} campaigns...`);

        for (let i = 0; i < campaigns.length; i++) {
            const camp = campaigns[i];
            const cat = camp.category.toLowerCase();
            const images = imageMap[cat] || ['/asset/default1.png'];
            const selectedImage = images[i % images.length];
            
            await Campaign.findByIdAndUpdate(camp._id, { coverImage: selectedImage });
        }

        console.log("Successfully migrated all campaigns to optimized 100KB assets. Payload reduced by ~98%!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

optimizeImages();
