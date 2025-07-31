const dotenv = require('dotenv');
const app = require('./src/app');

dotenv();
app();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});