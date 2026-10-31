const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const hotelRoutes = require("./routes/hotelRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "mySecretKey",
    resave: false,
    saveUninitialized: false
}));

app.use("/", authRoutes);
app.use("/", hotelRoutes);

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
