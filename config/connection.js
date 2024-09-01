// Import required modules
const { MongoClient } = require('mongodb');
const express = require('express');
const router = express.Router();
require('dotenv').config();

// State object to hold the database connection
const state = {
    db: null,
};

// Function to connect to the database
module.exports.connect = (done) => {
    const url = process.env.MONGODB_URI;
    const client = new MongoClient(url);
    const dbName = 'shopping';

    async function main() {
        try {
            await client.connect();
            console.log('Connected successfully to server');
            state.db = client.db(dbName);
            done(); // Call done callback after successful connection
        } catch (error) {
            console.error(error);
            done(error); // Call done with error if connection fails
        }
    }

    main();
};

// Function to get the database instance
module.exports.get = () => {
    return state.db;
};

