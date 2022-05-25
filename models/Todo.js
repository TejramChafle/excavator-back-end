const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: false
    },
    startTime: {
        type: Date,
        required: false
    },
    endTime: {
        type: Date,
        required: false
    },
    isCalendarEvent: {
        type: Boolean,
        default: true
    },
    isAllDay: {
        type: Boolean,
        default: false
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    isPriority: {
        type: Boolean,
        default: false
    },
    isStarred: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        trim: true
    },
    // list of ids assigned to the task
    tagIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
        required: true
    }],
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

const Todo = module.exports = mongoose.model('Todo', TodoSchema);