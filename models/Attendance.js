const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const AttendanceSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    // Attendace date | work day
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    // Working Hours
    startTime: {
        type: String,
        required: false
    },
    endTime: {
        type: String,
        required: false
    },
    // All day event flag to use in calender. This flag can be used to mark all day attendance for 24 hrs
    allDay: {
        type: Boolean,
        default: false
    },
    location: {
        type: String,
        required: false
    },
    notes: {
        type: String,
        required: false
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

AttendanceSchema.plugin(Paginate);
module.exports = mongoose.model('Attendance', AttendanceSchema);