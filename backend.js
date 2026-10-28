const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { User, Room, Guest } = require("./schema");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("."));

app.use(session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false
}));

async function startServer() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/hotel_user");

        console.log("Database is running");

        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
}

startServer();

app.post("/users", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            !name || !name.trim() ||
            !email || !email.trim() ||
            !password || !password.trim()
        ) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            return res.status(400).json({
                message: "Invalid email"
            });
        }

        if (
            password.length < 8 ||
            !/[A-Za-z]/.test(password) ||
            !/[0-9]/.test(password) ||
            !/[!@#$%&*.]/.test(password)
        ) {
            return res.status(400).json({
                message: "Password must have at least 8 characters, a letter, a number, and a special character."
            });
        }

        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                message: "No user found"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Wrong password"
            });
        }

        req.session.userId = user._id.toString();

        res.json({
            message: "Login successful"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/me", async (req, res) => {
    try {
        
        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please log in first"
            });
        }
    
        const user = await User.findById(req.session.userId)
            .select("name email");

        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

       
        if (!user.name || !user.email) {
            return res.status(400).json({
                message: "User name or email is missing"
            });
        }

        
        return res.status(200).json({
            name: user.name,
            email: user.email
        });

    } catch (error) {
        console.error("Error fetching user:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.post("/addrooms", async (req, res) => {
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

    } catch (err) {
        res.status(500).json({
            message: "Error adding rooms",
            error: err.message
        });
    }
});

app.get("/rooms", async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);

    } catch (err) {
        res.status(500).json({
            message: "Error fetching rooms",
            error: err.message
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

app.post("/rentroom", async (req, res) => {
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


app.get("/guest", async (req, res) => {
    try {
        const rent = await Guest.find();

        res.json(rent);

    } catch (err) {
        res.status(500).json({
            message: "Error fetching guests",
            error: err.message
        });
    }
});


app.put("/updatestatus/:id", async (req, res) => {
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