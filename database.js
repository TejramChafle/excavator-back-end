

const mongoose = require('mongoose');
/* mongoose.connect('mongodb://localhost/excavator')
    .then(() => console.log('connection succesful'))
    .catch((err) => console.error(err));

mongoose.connect('mongodb+srv://tejram:wizbeeuser@cluster0-qeebj.azure.mongodb.net/excavator?retryWrites=true')
    .then(() => console.log('connection succesful with azure.mongodb.net'))
    .catch((err) => console.error(err)); */

// replaced hardcoded URI with env
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true })
    .then(() => console.log('connection succesful'))
    .catch((err) => console.error(err));