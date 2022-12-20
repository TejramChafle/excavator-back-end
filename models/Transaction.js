const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const TransactionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // Type: INVOICE, EMPLOYEE_PAYMENT, FUEL_LOG, FARM_INCOME, OTHER_INCOME, MAINTENANCE, EXPENDITURE
    source: {
        type: String,
        required: true
    },
    // Type of transaction: INCOME, SPENDING, BORROWING, LENDING
    category: {
        type: String,
        required: true
    },
    // Source reference with ID
    sourceId: {
        type: String,
        required: true
    },
    // Payment mode: CASH | ONLINE ACCOUNT TRANSFER | BANK ACCOUNT TRANSFER, UPI, CREDIT/DEBIT CARD, PAYTM, CHEQUE, RTGS, NEFT, DD, OTHER-EWALLET
    mode: {
        type: String,
        required: true
    },
    // Payment amount
    amount: {
        type: Number,
        required: true
    },
    // Payment date
    date: {
        type: Date,
        required: true
    },
    // Payment status: PAID | PDC | FAILED | IN PROGRESS | AWAITING | CANCELED | PARTIALLY PAID | SCHEDULED | UNPAID
    status: {
        type: String,
        required: true
    },
    // Employee involved in transaction
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: false
    },
    // soft delete flag
    active: {
        type: Boolean,
        default: true
    },
    // business id
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
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

TransactionSchema.plugin(Paginate);
module.exports = mongoose.model('Transaction', TransactionSchema);