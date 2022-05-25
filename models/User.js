const mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const Paginate = require('mongoose-paginate');
// The user schema only defines the application level user. This will help to manage authentication & authorization
const UserSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false,
        unique: true,
        trim: true
    },
    otp: {
        type: String,
        required: false
    },
    token: {
        type: String,
        required: false
    },
    // soft delete flag
    isActive: {
        type: Boolean,
        default: true
    },
    avatar: {
        type: String,
        required: false
    }
},
{
    timestamps: true
});

UserSchema.plugin(Paginate);
// compare encrypted password with the password saved in db
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);