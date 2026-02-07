const fs = require('fs');
const path = require('path');

// Mock Data
const formData = new FormData();
formData.append('name', 'Test User');
formData.append('discordId', 'test#1234');
formData.append('scale', '64x64');
formData.append('part', 'full');
formData.append('price', '100');
formData.append('paymentMethod', 'bank');

// Create a dummy file
const dummyFilePath = path.join(__dirname, 'test_slip.txt');
fs.writeFileSync(dummyFilePath, 'dummy slip content');
const fileBlob = new Blob([fs.readFileSync(dummyFilePath)], { type: 'text/plain' });
formData.append('slip', fileBlob, 'test_slip.txt');

console.log('🚀 Sending Test Order to http://localhost:3000/api/order ...');

fetch('http://localhost:3000/api/order', {
    method: 'POST',
    body: formData
})
    .then(async response => {
        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Response: ${text}`);
        try {
            const json = JSON.parse(text);
            if (json.success) {
                console.log('✅ SUCCESS: Order created!');
            } else {
                console.error('❌ FAILED: Server returned error.');
            }
        } catch (e) {
            console.error('❌ FAILED: Invalid JSON response.');
        }
    })
    .catch(error => {
        console.error('❌ NETWORK ERROR:', error);
    })
    .finally(() => {
        // Cleanup
        if (fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);
    });
