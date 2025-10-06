require('dotenv').config();
const app = require('./app/app');
const { startScheduler } = require('./app/services/scheduler.service');

const PORT = process.env.PORT || 8888;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API is running on PORT: ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Network: http://192.168.10.33:${PORT}`);
    
    // Start auto-lock scheduler
    startScheduler();
})
