const mongoose = require('mongoose');
const Paginate = require('mongoose-paginate');

const ContactSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    personal: {
        type: {
            firstname: String,
            lastname: String,
            gender: String,
            birthday: Date
        },
        required: true
    },
    contact: {
        type: {
            mobile: String,
            phone: String,
            email: {
                type: String,
                match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                trim: true,
                required: false
            },
            address: String,
        },
        required: false
    },
    work: {
        type: {
            company: {
                type: String,
                required: false
            },
            designation: {
                type: String,
                required: false
            },
            description: {
                type: String,
                required: false
            },
            address: {
                type: String,
                required: false
            }
        },
        required: false
    },
    type: {
        type: String,
        required: false
    },
    // soft delete flag
    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

ContactSchema.plugin(Paginate);
module.exports = mongoose.model('Contact', ContactSchema);

// Get the contact full name
ContactSchema.virtual('fullname').get(function() {
    console.log('fullname : ',this.firstname + ' ' + this.lastname);
    return this.firstname + ' ' + this.lastname;
});

/* module.exports.getUserByUsername = function(username, cb) {
	Users.findOne({loginid: username}, cb);
} */