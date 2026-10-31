const express = require("express");
const bcrypt = require("bcrypt");

const { User } = require("../models/schema");

const router = express.Router();


// REGISTER USER
router.post("/users", async (req, res) => {
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


// LOGIN USER
router.post("/login", async (req, res) => {
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


// GET CURRENT USER
router.get("/me", async (req, res) => {
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


module.exports = router;
