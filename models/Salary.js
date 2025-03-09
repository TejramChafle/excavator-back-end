const mongoose =  require('mongoose');
const paginate = require('mongoose-paginate');

const SalarySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    // Number of days payment amount paid covers
    totalPaidDays: {
        type: Number,
        required: true
    },
    totalPayable: {
        type: Number,
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    balanceDue: {
        type: Number,
        required: true
    },
    advancedPaid: {
        type: Number,
        required: true
    },
    /* paidFromDate: {
        type: Date,
        required: true
    },
    paidToDate: {
        type: Date,
        required: true
    }, */
    paidDates: {
        type: Array,
        required: true
    },
    remarks: {
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

SalarySchema.plugin(paginate);
module.exports = mongoose.model('Salary', SalarySchema);