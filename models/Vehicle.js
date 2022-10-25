const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const VehicleSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // name of modules including contact/todos/work/reminder
    name: {
        type: String,
        required: true
    },
    // CAR/TRACTOR/TRUCK/DOZER etc.
    type: {
        type: String,
        required: true
    },
    // MH49-R-2113
    number: {
        type: String,
        required: true
    },
    // 5 ton / 300 sqft etc.
    capacity: {
        type: String,
        required: true
    },
    // petrol/diesel/cng
    fuel: {
        type: String,
        required: true
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

VehicleSchema.plugin(Paginate);
module.exports = mongoose.model('Vehicle', VehicleSchema);