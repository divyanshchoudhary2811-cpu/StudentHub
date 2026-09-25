// ==========================================
// STUDENT HUB - CREATE ADMIN ACCOUNT
// ==========================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const Admin = require("./Models/Admin");


// ==========================================
// CREATE ADMIN FUNCTION
// ==========================================

async function createAdmin() {

    try {

        // --------------------------------------
        // CONNECT TO MONGODB
        // --------------------------------------

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "MongoDB connected successfully!"
        );


        // --------------------------------------
        // CHECK IF ADMIN ALREADY EXISTS
        // --------------------------------------

        const existingAdmin =
            await Admin.findOne({
                username: "admin"
            });


        if (existingAdmin) {

            console.log(
                "Admin account already exists."
            );

            await mongoose.connection.close();

            return;

        }


        // --------------------------------------
        // HASH PASSWORD
        // --------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                "admin123",
                10
            );


        // --------------------------------------
        // CREATE ADMIN
        // --------------------------------------

        const admin =
            new Admin({

                username: "admin",

                password:
                    hashedPassword

            });


        await admin.save();


        // --------------------------------------
        // SUCCESS MESSAGE
        // --------------------------------------

        console.log(
            "Admin account created successfully!"
        );

        console.log(
            "Username: admin"
        );

        console.log(
            "Password: admin123"
        );


        // --------------------------------------
        // CLOSE DATABASE CONNECTION
        // --------------------------------------

        await mongoose.connection.close();

        console.log(
            "Database connection closed."
        );


    } catch (error) {

        console.error(
            "Error creating admin:"
        );

        console.error(error);

        // Close connection if an error occurs
        if (mongoose.connection.readyState !== 0) {

            await mongoose.connection.close();

        }

    }

}


// ==========================================
// RUN FUNCTION
// ==========================================

createAdmin();