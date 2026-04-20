const path = require('path');
const fs = require('fs');

const base = path.join(__dirname, 'server/index.js');
console.log('Testing requirements for:', base);

try {
    require('./routes/auth');
    console.log('✅ auth routes ok');
    require('./routes/campaign');
    console.log('✅ campaign routes ok');
    require('./routes/donation');
    console.log('✅ donation routes ok');
    require('./routes/call');
    console.log('✅ call routes ok');
    require('./routes/admin');
    console.log('✅ admin routes ok');
    require('./routes/contact');
    console.log('✅ contact routes ok');
    require('./routes/notification');
    console.log('✅ notification routes ok');
    require('./routes/itemListing');
    console.log('✅ itemListing routes ok');
    require('./routes/ngoNeed');
    console.log('✅ ngoNeed routes ok');
} catch (error) {
    console.error('❌ Requirement Check Failed:', error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
       console.error('Missing Module Path:', error.path);
    }
}
