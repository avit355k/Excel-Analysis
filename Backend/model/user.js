const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address',
        ],
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        default: "user",
        enum: ['user', 'admin'],
    },
    otp: {
        type: Number,
    },
    otpExpiry: {
        type: Date,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
