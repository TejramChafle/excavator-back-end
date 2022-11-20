const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const WorkSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
		required: true
	},
	date: {
		type: Date,
		required: true
    },
    startTime: {
		type: String,
		required: true
    },
    endTime: {
		type: String,
		required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
		required: true
    },
    site: {
        type: String,
		required: true
    },
    workers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
    	required: true
    }],
    rate: {
    	type: Number,
    	required: true
    },
    quantity: {
    	type: Number,
    	required: true
    },
    total: {
    	type: Number,
    	required: true
    },
    description: {
        type: String,
        required: false
    },
    // soft delete flag
    isActive: {
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

WorkSchema.plugin(Paginate);
module.exports = mongoose.model('Work', WorkSchema);

