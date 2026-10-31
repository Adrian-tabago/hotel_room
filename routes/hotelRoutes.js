const express = require("express");

const { User, Room, Guest } = require("../models/schema");

const router = express.Router();



router.post("/addrooms", async (req, res) => {
    try {
        const count = await Room.countDocuments();

        if (count > 0) {
            return res.status(400).json({
                message: "Rooms already exist!"
            });
        }

        const rooms = [
            { roomNumber: "101", roomType: "Standard", floor: 1, status: "Available", feature: "Queen bed", guests: 2, rate: 1800 },
            { roomNumber: "102", roomType: "Standard", floor: 1, status: "Available", feature: "Queen bed", guests: 2, rate: 1800 },
            { roomNumber: "103", roomType: "Standard", floor: 1, status: "Available", feature: "Twin beds", guests: 2, rate: 1800 },
            { roomNumber: "104", roomType: "Standard", floor: 1, status: "Available", feature: "Queen bed", guests: 2, rate: 1800 },

            { roomNumber: "201", roomType: "Deluxe", floor: 2, status: "Available", feature: "King bed", guests: 2, rate: 2800 },
            { roomNumber: "202", roomType: "Deluxe", floor: 2, status: "Available", feature: "King bed", guests: 2, rate: 2800 },
            { roomNumber: "203", roomType: "Deluxe", floor: 2, status: "Available", feature: "Twin beds", guests: 3, rate: 2800 },
            { roomNumber: "204", roomType: "Deluxe", floor: 2, status: "Available", feature: "King bed", guests: 2, rate: 2800 },

            { roomNumber: "301", roomType: "Suite", floor: 3, status: "Available", feature: "King bed and living area", guests: 4, rate: 4500 },
            { roomNumber: "302", roomType: "Suite", floor: 3, status: "Available", feature: "King bed and living area", guests: 4, rate: 4500 },
            { roomNumber: "303", roomType: "Suite", floor: 3, status: "Available", feature: "Two queen beds", guests: 4, rate: 4500 },
            { roomNumber: "304", roomType: "Suite", floor: 3, status: "Available", feature: "King bed and living area", guests: 4, rate: 4500 }
        ];

        const addedroom = await Room.insertMany(rooms);

        res.json({
            message: "Rooms saved successfully!",
            total: addedroom.length
        });

    } catch (error) {
        res.status(500).json({
            message: "Error adding rooms",
            error: error.message
        });
    }
});



router.get("/rooms", async (req, res) => {
    try {
        const rooms = await Room.find();

        res.json(rooms);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching rooms",
            error: error.message
        });
    }
});



function getRoomStatus(checkIn, checkOut) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);

    if (today < checkInDate) {
        return "Reserved";
    }

    if (today >= checkInDate && today < checkOutDate) {
        return "Occupied";
    }

    return "Cleaning";
}


router.post("/rentroom", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        const {
            name,
            number,
            guestCount,
            roomNumber,
            checkIn,
            checkOut,
            specialRequests
        } = req.body;

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const room = await Room.findOne({
            roomNumber: roomNumber
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        if (room.status !== "Available") {
            return res.status(400).json({
                message: "Room is not available"
            });
        }

        const guest = await Guest.create({
            name: name,
            number: number,
            email: user.email,
            owner: user._id,
            roomNumber: roomNumber,
            roomType: room.roomType,
            guestCount: guestCount,
            checkIn: checkIn,
            checkOut: checkOut,
            specialRequests: specialRequests
        });

        room.status = getRoomStatus(checkIn, checkOut);
        await room.save();

        res.status(201).json({
            message: "Room reserved successfully",
            guest: guest,
            roomStatus: room.status
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Failed to rent room",
            error: error.message
        });
    }
});


router.get("/guest", async (req, res) => {
    try {
        const rent = await Guest.find();

        res.json(rent);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching guests",
            error: error.message
        });
    }
});


router.put("/updatestatus/:id", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const { status } = req.body;

        const update = await Room.findOneAndUpdate(
            {
                _id: req.params.id,
                owner: user._id
            },
            {
                status: status
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!update) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        res.json({
            message: "Room status updated successfully",
            room: update
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update room status",
            error: error.message
        });
    }
});


module.exports = router;
