const mongoose = require('mongoose');

const ServiceSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
    name: {
		type: String,
		required: true
	},
	rate: {
        type: Number,
		required: true
    },
    // Per hour/day/trip/person [Configuration]
    billingType: {
        type: String,
		required: true
    },
    // comment/note
	description: {
        type: String,
        required: false
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
    },
    // date & time of record creation
    createdDate: {
        type: Date,
        required: true
    },
    // last date & time of record updation
    updatedDate: {
        type: Date,
        default: Date.now,
        required: true
    }
});

module.exports = mongoose.model('Service', ServiceSchema);