const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const BillingSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // collection of works for which bill will be created
    works: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work',
        required: true
    }],
    // contractor/client id
    billedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        required: true
    },
    // billing date
    date: {
        type: Date,
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    },
    gstPercent: {
        type: Number,
        required: true
    },
    gstAmount: {
        type: Number,
        required: true
    },
    tdsPercent: {
        type: Number,
        required: false
    },
    tdsAmount: {
        type: Number,
        required: false
    },
    billedAmount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    isPaid: {
        type: Boolean,
        default: true
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
    // last updated by user id
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{
    timestamps: true
});

BillingSchema.plugin(Paginate);
module.exports = mongoose.model('Billing', BillingSchema);