const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const TagSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // name of modules including contact/todos/work/reminder
    purpose: {
        type: String,
        required: true
    },
    name: {
        type: String,
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
    }
},
{
    timestamps: true
});

TagSchema.plugin(Paginate);
module.exports = mongoose.model('Tag', TagSchema);