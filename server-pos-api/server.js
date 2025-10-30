require('dotenv').config();
const app = require('./app/app');

const PORT = process.env.PORT || 8888;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVER STARTED - ${new Date().toISOString()}`);
    console.log(`🔑 Auth Service Debug: is_sa field should be included in JWT`);
    console.log(`API is running on PORT: ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://192.168.10.33:${PORT}`);
})
