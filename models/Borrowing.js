const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const BorrowingSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: {
        type: Date,
        required: true
    },
    scheduledReturnDate: {
        type: Date,
        required: false
    },
    // BORROWED/LEND
    type: {
        type: String,
        required: true
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
    // person from/to borrowed/lend
    person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
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

BorrowingSchema.plugin(Paginate);
module.exports = mongoose.model('Borrowing', BorrowingSchema);