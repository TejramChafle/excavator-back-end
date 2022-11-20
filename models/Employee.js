const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const EmployeeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // personal info
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },

    // contact info
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    alternatePhone: {
        type: String,
        required: false
    },
    emergencyPhone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        trim: true,
        required: false
    },

    // medical & insurance
    bloodGroup: {
        type: String,
        required: false
    },
    insuranceName: {
        type: String,
        required: false
    },
    insuranceNumber: {
        type: String,
        required: false
    },
    insurancePremium: {
        type: String,
        required: false
    },
    insuranceAmount: {
        type: String,
        required: false
    },

    // bank details
    bankName: {
        type: String,
        required: false
    },
    ifscCode: {
        type: String,
        required: false
    },
    accountNumber: {
        type: String,
        required: false
    },
    upiId: {
        type: String,
        required: false
    },

    // office detail
    designation: {
        type: String,
        required: true
    },
    dateOfJoin: {
        type: Date,
        required: false
    },
    wageType: {
        type: String,
        required: false
    },
    wagePerDay: {
        type: Number,
        required: false
    },
    wagePerMonth: {
        type: Number,
        required: false
    },
    wagePerYear: {
        type: Number,
        required: false
    },
    incentive: {
        type: Number,
        required: false
    },
    weekendOff: {
        type: String,
        required: false
    },
    disabledOn: {
        type: Date,
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

EmployeeSchema.plugin(Paginate);
module.exports = mongoose.model('Employee', EmployeeSchema);