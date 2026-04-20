const mongoose = require('mongoose');
const User = require('./models/User');
const Campaign = require('./models/Campaign');
require('dotenv').config();

const categories = ['education', 'food', 'health', 'disaster', 'environment', 'women', 'child', 'animal'];

const dummyTitles = {
    education: ["Smart Classrooms for Villages", "Books for Every Child", "Laptop Drive for Tribals", "Evening Schools for Workers", "Scholarships for Merit", "Library in a Box", "Science Lab on Wheels"],
    food: ["Daily Meals for Orphans", "End Hunger Today", "Community Kitchen Initiative", "Zero Waste Food Bank", "Breakfast for Slum Kids", "Grocery Kits for Widows", "Nutrition for Lactating Mothers"],
    health: ["Mobile Health Clinic", "Cancer Screening Camp", "Dialysis Support Fund", "Immunization Drive", "Mental Health Helpline", "Clean Water Mission", "First Aid Training"],
    disaster: ["Flood Relief Kits", "Rebuilding Homes after Earthquake", "Cyclone Emergency Fund", "Drought Resistance Farm", "Fire Victim Support", "Emergency Ambulance Fund", "Tsunami Recovery"],
    environment: ["Million Trees Mission", "Plastic Free Beaches", "Clean Ganga Project", "Solar Lights for Remote Areas", "Urban Forestation", "Waste Management Training", "Save the Wetlands"],
    women: ["Self Defense Workshops", "Women Entrepreneurship Fund", "Safe Shelter for Survivors", "Skills Training Center", "Menstrual Hygiene Awareness", "Literacy for Adults", "Legal Aid for Women"],
    child: ["Safe School Transport", "Preventing Child Labor", "Sports Training for Youth", "Anti-Trafficking Unit", "Vaccination for Neonates", "Playgrounds in Slums", "Vocational Guidance"],
    animal: ["Stray Dog Vaccination", "Cow Shelter Support", "Save the Sparrows", "Emergency Veterinary Van", "Protecting Olive Ridleys", "Street Animal Feeding", "Anti-Poaching Unit"]
};

const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune"];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/servex');
        console.log("Connected to MongoDB...");

        // 1. Create 5 Mock NGOs if they don't exist
        const ngoEmails = [
            'ngo1@servex.org',
            'ngo2@servex.org',
            'ngo3@servex.org',
            'ngo4@servex.org',
            'ngo5@servex.org'
        ];

        const ngoIds = [];
        for (let i = 0; i < ngoEmails.length; i++) {
            let ngo = await User.findOne({ email: ngoEmails[i] });
            if (!ngo) {
                ngo = await User.create({
                    name: `Verified NGO ${i + 1}`,
                    email: ngoEmails[i],
                    password: 'password123',
                    role: 'ngo',
                    isVerified: true,
                    phone: `999900000${i}`,
                    location: { city: cities[i % cities.length] }
                });
                console.log(`Created NGO: ${ngo.email}`);
            }
            ngoIds.push(ngo._id);
        }

        // 2. Clear existing dynamic check
        // await Campaign.deleteMany({ title: { $regex: /Dummy/i } }); 

        // 3. Inject Campaigns
        let totalCreated = 0;
        for (const cat of categories) {
            const titles = dummyTitles[cat];
            for (let j = 0; j < titles.length; j++) {
                const target = Math.floor(Math.random() * 500000) + 100000;
                const raised = Math.floor(Math.random() * (target * 0.4));
                
                await Campaign.create({
                    title: titles[j],
                    description: `This is a verified campaign to support ${cat} in ${cities[j % cities.length]}. Your help makes a direct impact.`,
                    targetAmount: target,
                    raisedAmount: raised,
                    category: cat,
                    ngoId: ngoIds[j % ngoIds.length],
                    location: { 
                        city: cities[j % cities.length],
                        coordinates: [77.2090 + Math.random(), 28.6139 + Math.random()] 
                    },
                    status: 'active',
                    coverImage: `/asset/img${(j % 4) + 1}.png`,
                    donorCount: Math.floor(Math.random() * 50) + 5
                });
                totalCreated++;
            }
            console.log(`Finished seeding category: ${cat}`);
        }

        console.log(`Successfully seeded ${totalCreated} campaigns!`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
