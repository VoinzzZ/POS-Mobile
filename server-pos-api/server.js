require('dotenv').config();
const app = require('./app/app');

const PORT = process.env.PORT || 8888;

app.listen(PORT, () => {
    console.log(`API is running on PORT: ${PORT}`);
})