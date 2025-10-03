const axios = require('axios');

const API_URL = 'https://esmeralda-unshod-maura.ngrok-free.dev/api/v1';

async function testAPI() {
    try {
        console.log('🔍 Testing API endpoints...\n');

        // Test health
        console.log('1. Testing /health');
        const health = await axios.get('https://esmeralda-unshod-maura.ngrok-free.dev/health', {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        console.log('✅ Health:', health.data);

        // Try to get categories without auth (should fail)
        console.log('\n2. Testing /category without auth');
        try {
            await axios.get(`${API_URL}/category`, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
        } catch (error) {
            console.log('❌ Expected error:', error.response?.status, error.response?.data);
        }

        // Login first
        console.log('\n3. Attempting login...');
        console.log('📝 Please provide test credentials:');
        console.log('   Email: admin@example.com (or your registered email)');
        console.log('   Password: your password');
        
        // You need to replace these with actual credentials
        const loginData = {
            email: 'admin@example.com',
            password: 'YourPassword123'
        };

        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, loginData, {
                headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            
            const token = loginRes.data.data.tokens.accessToken;
            console.log('✅ Login successful! Token:', token.substring(0, 20) + '...');

            // Test category with auth
            console.log('\n4. Testing /category with auth');
            const categories = await axios.get(`${API_URL}/category`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            console.log('✅ Categories:', categories.data);

            // Test brand with auth
            console.log('\n5. Testing /brand with auth');
            const brands = await axios.get(`${API_URL}/brand`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            console.log('✅ Brands:', brands.data);

            // Test product with auth
            console.log('\n6. Testing /product with auth');
            const products = await axios.get(`${API_URL}/product`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            console.log('✅ Products:', products.data);

        } catch (loginError) {
            console.log('❌ Login failed:', loginError.response?.status, loginError.response?.data);
            console.log('\n⚠️  You need to register a user first or update credentials in test-api.js');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAPI();
