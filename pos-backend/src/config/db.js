const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDb Connected");
    } catch (err) {
        console.error('MongoDb Eror: ', err)
        process.exit(1);
    }
};

module.exports = { connectDb };