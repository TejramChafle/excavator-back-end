const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

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

ServiceSchema.plugin(Paginate);
module.exports = mongoose.model('Service', ServiceSchema);