
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);const roomSchema = new mongoose.Schema(
    {
        roomNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        roomType: {
            type: String,
            required: true,
            enum: ["Standard", "Deluxe", "Suite"]
        },
        status: {
            type: String,
            required: true,
            enum: ["Available", "Reserved", "Checked In", "Cleaning"],
            default: "Available"
        },

        floor: {
            type: Number,
            required: true
        },
        feature: {
            type: String,
            required: true
        },
        guests: {
            type: Number,
            required: true
        },
        rate: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);
const guestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        number: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: true
        },
        roomNumber: {
            type: String,
            required: true,
            trim: true
        },
        roomType: {
            type: String,
            required: true,
            enum: ["Standard", "Deluxe", "Suite"]
        },
        checkIn: {
            type: Date,
            required: true
        },
        checkOut: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);
const Room = mongoose.model("Room", roomSchema);
const Guest = mongoose.model("Guest", guestSchema);

module.exports = { User, Room, Guest };
