const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const ContactSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: false
    },
    nickname: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: true
    },
    alternatePhone: {
        type: String,
        required: false
    },
    company: {
        type: String,
        required: false
    },
    jobTitle: {
        type: String,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    birthday: {
        type: Date,
        required: false
    },
    email: {
        type: String,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        trim: true,
        required: false
    },
    contactType: {
        type: String,
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

ContactSchema.plugin(Paginate);
module.exports = mongoose.model('Contact', ContactSchema);

// Get the contact full name
ContactSchema.virtual('fullname').get(function () {
    return this.firstNname + ' ' + this.lastName;
});