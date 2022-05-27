const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');
// The user schema only defines the application level user. This will help to manage authentication & authorization
const BusinessSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    tagline: {
        type: String,
        required: false
    },
    about: {
        type: String,
        required: false
    },
    logo: {
        type: String,
        required: false
    },
    owner: {
        type: {
            name: String,
            email: String,
            phone: String
        },
        required: false
    },
    panNo: {
        type: String,
        required: false
    },
    gstNo: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },
    alternatePhone: {
        type: String,
        required: false,
        trim: true
    },
    address: {
        type: String,
        required: false
    },
    // soft delete flag
    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

BusinessSchema.plugin(Paginate);
module.exports = mongoose.model('Business', BusinessSchema);