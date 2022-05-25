const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    // name of Event
    name: {
        type: String,
        required: true
    },
    // comment/note
    description: {
        type: String,
        required: false
    },
    // start time
    start_time: {
        type: Date,
        required: false
    },
    // end time
    end_time: {
        type: Date,
        required: false
    },
    // month loop will help to identify if the event will happen on every month on same date & time
    month_loop: {
        type: Boolean,
        default: true
    },
    // Flag to indicate the all day event
    all_day: {
        type: Boolean,
        default: true
    },
    // soft delete flag
    is_active: {
        type: Boolean,
        default: true
    },
    // created by user id
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // date & time of record creation
    created_date: {
        type: Date,
        required: true
    },
    // last date & time of record updation
    updated_date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const Event = module.exports = mongoose.model('Event', EventSchema);