const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');
require('dotenv').config();

const imageMap = {
    animal: ['/asset/animal1.png', '/asset/animal2.png', '/asset/animal3.png'],
    women: ['/asset/women1.png', '/asset/women2.png'],
    environment: ['/asset/env1.png', '/asset/env2.png'],
    disaster: ['/asset/disaster1.png', '/asset/img4.png'],
    health: ['/asset/health1.png', '/asset/img3.png'],
    education: ['/asset/edu1.png', '/asset/img1.png'],
    food: ['/asset/img2.png'],
    child: ['/asset/img1.png', '/asset/img4.png']
};

async function updateImages() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/servex');
        console.log("Connected to MongoDB...");

        const campaigns = await Campaign.find({});
        console.log(`Updating ${campaigns.length} campaigns...`);

        for (let i = 0; i < campaigns.length; i++) {
            const camp = campaigns[i];
            const cat = camp.category.toLowerCase();
            const images = imageMap[cat] || ['/asset/img1.png'];
            
            // Assign a unique image based on index to ensure variety
            const selectedImage = images[i % images.length];
            
            await Campaign.findByIdAndUpdate(camp._id, { coverImage: selectedImage });
        }

        console.log("Successfully updated all campaign images to be category-specific and unique!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateImages();
