const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const RevenueSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: {
        type: Date,
        required: true
    },
    // revenue source type: FARM, RENT, INVOICE, OTHER
    source: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    // person/customer
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: false
    },
    // transaction detail id
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    // business id
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    // soft delete flag
    active: {
        type: Boolean,
        default: true
    },
    // created by user id
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // updated by user id
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
{
    timestamps: true
});

RevenueSchema.plugin(Paginate);
module.exports = mongoose.model('Revenue', RevenueSchema);