const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const FuelLogSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // Fuel: PETROL, DIESEL, CNG, KEROSENE, OTHER
    fuel: {
        type: String,
        required: true
    },
    // petrol pump detail
    petrolPump: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PetrolPump',
        required: true
    },
    // Fuel rate
    rate: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    // Vehicle filled in
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: false
    },
    // Employee who bought petrol
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: false
    },
    invoiceId: {
        type: String,
        required: false
    },
    // soft delete flag
    active: {
        type: Boolean,
        default: true
    },
    // transaction id
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

FuelLogSchema.plugin(Paginate);
module.exports = mongoose.model('FuelLog', FuelLogSchema);