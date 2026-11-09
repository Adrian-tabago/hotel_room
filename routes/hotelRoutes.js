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



  //aayusin kopa
function getRoomStatus(checkIn, checkOut, room, isNewReservation = false) {
    const today = new Date();

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);

    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);

    if (!isNewReservation && room.status === "Available") {
        return "Available";
    }

    if (todayDate < checkInDate) {
        return "Reserved";
    }

    if (todayDate >= checkInDate && todayDate < checkOutDate) {
        return "Occupied";
    }

    if (!room.cleaningStartedAt) {
        return "Cleaning";
    }

    const cleaningEnd = new Date(
        new Date(room.cleaningStartedAt).getTime() + (1 * 60 * 1000)
    );

    if (today < cleaningEnd) {
        return "Cleaning";
    }

    return "Available";
}

  //aayusin kopa
async function updateRoomStatuses() {
    try {
        const rooms = await Room.find();
        const guests = await Guest.find();

        for (const room of rooms) {

            if (room.status === "Maintenance") {
                continue;
            }

            if (room.status === "Cleaning") {

                if (!room.cleaningStartedAt) {
                    room.cleaningStartedAt = new Date();
                    await room.save();
                    continue;
                }

                const cleaningEnd = new Date(
                    new Date(room.cleaningStartedAt).getTime() + (1 * 60 * 1000)
                );

                if (new Date() >= cleaningEnd) {
                    room.status = "Available";
                    room.cleaningStartedAt = null;

                    await room.save();

                    console.log(`Room ${room.roomNumber} is now Available`);
                }

                continue;
            }

            const roomGuests = guests.filter(guest =>
                String(guest.roomNumber) === String(room.roomNumber)
            );

            roomGuests.sort((a, b) =>
                new Date(b.checkIn) - new Date(a.checkIn)
            );

            const guest = roomGuests[0];

            if (!guest || !guest.checkIn || !guest.checkOut) {
                continue;
            }

            const newStatus = getRoomStatus(
                guest.checkIn,
                guest.checkOut,
                room
            );

            if (newStatus === "Cleaning" && !room.cleaningStartedAt) {
                room.cleaningStartedAt = new Date();
            }

            if (newStatus !== room.status) {
                room.status = newStatus;

                console.log(
                    `Room ${room.roomNumber} changed to ${newStatus}`
                );
            }

            await room.save();
        }

    } catch (error) {
        console.log("Room status error:", error);
    }
}



updateRoomStatuses();

setInterval(() => {
    console.log("Checking room statuses...");
    updateRoomStatuses();
}, 50000);


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

        room.status = getRoomStatus(checkIn, checkOut, room, true);
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




router.get("/details/:id", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        const guest = await Guest.findById(req.params.id);

        if (!guest) {
            return res.status(404).json({
                message: "Guest not found"
            });
        }

        const isOwner = String(guest.owner) === String(req.session.userId);

        const name = String(guest.name || "");
        const email = String(guest.email || "");
        const number = String(guest.number || "");

        const result = {
            _id: guest._id,
            name: isOwner ? name : name.charAt(0) + "******",
            email: isOwner ? email : email.charAt(0) + "****@****",
            number: isOwner ? number : "*******" + number.slice(-4),
            roomNumber: guest.roomNumber,
            roomType: guest.roomType,
            checkIn: guest.checkIn,
            checkOut: guest.checkOut,
            isOwner: isOwner
        };

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching guest details"
        });
    }
});



router.put("/checkout/:id", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }

        const guest = await Guest.findOne({
            _id: req.params.id,
            owner: req.session.userId
        });

        if (!guest) {
            return res.status(403).json({
                message: "You cannot check out this guest"
            });
        }

        const room = await Room.findOne({
            roomNumber: guest.roomNumber
        });

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        if (room.status !== "Occupied") {
            return res.status(400).json({
                message: "Only occupied rooms can be checked out"
            });
        }

       room.status = "Cleaning";
        room.cleaningStartedAt = new Date();

        await room.save();

        await Guest.findByIdAndDelete(guest._id);

        res.json({
            message: "Guest checked out successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Checkout failed"
        });
    }
});



module.exports = router;
