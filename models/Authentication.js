const mongoose = require('mongoose');

const AuthenticationSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // device information of the user
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: false
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('Authentication', AuthenticationSchema);