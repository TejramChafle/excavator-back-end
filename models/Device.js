const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const DeviceSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    model: {
        type: String,
        required: false
    },
    platform: {
        type: String,
        required: false
    },
    uuid: {
        type: String,
        required: false
    },
    version: {
        type: String,
        required: false
    },
    manufacturer: {
        type: String,
        required: false
    },
    serial: {
        type: String,
        required: false
    },
    firebaseToken: {
        type: String,
        required: false
    }
},
{
    timestamps: true
});

DeviceSchema.plugin(Paginate);
module.exports = mongoose.model('Device', DeviceSchema);