const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
require('dotenv').config({ path: './.env' });

async function injectTestNotification() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/servex');
    console.log('Connected to DB');

    // Find the user sumitrajslm2018@gmail.com
    const user = await User.findOne({ email: 'sumitrajslm2018@gmail.com' });
    if (!user) {
      console.log('User not found. Please register sumitrajslm2018@gmail.com first.');
      process.exit(1);
    }

    const notif = await Notification.create({
      userId: user._id,
      title: 'Success! Notification System Live 🚀',
      body: 'Your in-app notification system is now fully functional. You will see alerts here for donations and system updates.',
      type: 'system',
      link: '/donor-dashboard'
    });

    console.log('Test notification injected successfully for user:', user.name);
    console.log('Notification ID:', notif._id);
    process.exit(0);
  } catch (err) {
    console.error('Error injecting notification:', err);
    process.exit(1);
  }
}

injectTestNotification();
