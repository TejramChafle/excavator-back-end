const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const ExpendituresSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: {
        type: Date,
        required: true
    },
    place: {
        type: String,
        required: false
    },
    // RENT, BIKE, FUEL, GROCERY, TRANSPORTATION, TELEPHONE, HOSTPITAL, INSURANCE, ENTERTAINMENT, SHOPPING, FOOD, UTILITIES, MEMBERSHIP, OTHER
    purpose: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    // employee/person involved in transaction/deal
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
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

ExpendituresSchema.plugin(Paginate);
module.exports = mongoose.model('Expenditures', ExpendituresSchema);