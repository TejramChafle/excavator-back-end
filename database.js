

const mongoose = require('mongoose');
const Counter = require('./models/Counter');

/* mongoose.connect('mongodb://localhost/excavator')
    .then(() => console.log('connection succesful'))
    .catch((err) => console.error(err));

mongoose.connect('mongodb+srv://tejram:wizbeeuser@cluster0-qeebj.azure.mongodb.net/excavator?retryWrites=true')
    .then(() => console.log('connection succesful with azure.mongodb.net'))
    .catch((err) => console.error(err)); */

// replaced hardcoded URI with env
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true })
    .then(async() => {
        console.log('connection succesful');
        // await initializeCounter(); // Initialize counter with starting value
    })
    .catch((err) => console.error(err));


// Initialize the Invoice counter from 1000
async function initializeCounter() {
    try {
        await Counter.updateOne(
            { _id: 'invoice' },
            { $set: { seq: 1000 } },
            { upsert: true } // Create if not already exists
        );
        console.log('Counter initialized successfully.');
    } catch (error) {
        console.error('Error initializing counter:', error);
    }
}