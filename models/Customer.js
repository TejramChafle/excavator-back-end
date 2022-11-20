const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const CustomerSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        trim: true,
        required: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        required: false
    },
    // business id
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    // soft delete flag
    isActive: {
        type: Boolean,
        default: true
    },
    // created by user id
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // created by user id
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{
    timestamps: true
});

CustomerSchema.plugin(Paginate);
module.exports = mongoose.model('Customer', CustomerSchema);