const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const PetrolPumpSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // Name of the petrol pump
    name: {
        type: String,
        required: true
    },
    // location/town/village
    place: {
        type: String,
        required: true
    },
    contact: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
        required: false
    },
    // petrol/diesel/cng rate
    rate: {
        type: Array,
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

PetrolPumpSchema.plugin(Paginate);
module.exports = mongoose.model('PetrolPump', PetrolPumpSchema);