const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');
const Counter = require('./Counter');

const InvoiceSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // collection of works for which bill will be created
    works: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Work',
        required: true
    }],
    // Auto-incrementing invoice number
    invoiceNumber: {
        type: Number,
        unique: true
    },
    // contractor/client id
    invoiceTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    // Name of the invoiced to party, this can be manually updated while invoice
    invoiceToName: {
        type: String,
        required: true
    },
    // Business id
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    invoiceFromName: {
        type: String,
        required: true
    },
    // Invoice date
    date: {
        type: Date,
        required: false
    },
    // This can be title, date or date range
    invoiceBrief: {
        type: String,
        required: false
    },
    discount: {
        type: Number,
        required: false
    },
    gstPercent: {
        type: Number,
        required: false
    },
    gstAmount: {
        type: Number,
        required: false
    },
    tdsPercent: {
        type: Number,
        required: false
    },
    tdsAmount: {
        type: Number,
        required: false
    },
    invoicedAmount: {
        type: Number,
        required: true
    },
    // Notes: Option notes to keep track of communication/updates
    description: {
        type: String,
        required: false
    },
    // Invoice status: DEFINED | SHARED | PROCESSED | APPROVED | DENIED | HOLD | OVERDUE
    status: {
        type: String,
        default: true
    },
    // Expected clearance date: useful to track pending and overdue invoices
    expectedClearanceDate: {
        type: Date,
        required: false
    },
    statusHistory: {
        type: Array,
        required: false
    },
    // Payment details
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
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

// Pre-save middleware to generate an auto-incrementing invoice number
InvoiceSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'invoice' },
                { $inc: { seq: 1 } }, // Increment the sequence number
                { new: true, upsert: true } // Create the counter if it doesn't exist
            );
            this.invoiceNumber = counter.seq;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

InvoiceSchema.plugin(Paginate);
module.exports = mongoose.model('Invoice', InvoiceSchema);