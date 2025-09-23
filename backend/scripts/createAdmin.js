
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

//const uri = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority";
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const parsedEnv = require('dotenv').parse(envConfig);

const uri = parsedEnv.MONGO_URI;

const createOrUpdateAdmin = async () => {
    try {
        console.log("Connecting to MongoDB with URI:", uri);
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("MongoDB connected");

        const password = process.argv[2];
        if (!password || password.length < 6) {
            console.log('Please provide a password with at least 6 characters');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await User.findOneAndUpdate(
            { role: 'Admin' },
            {
                username: 'admin',
                password: hashedPassword,
                role: 'Admin'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (admin) {
            console.log('Admin user created or updated successfully');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
}

createOrUpdateAdmin();
