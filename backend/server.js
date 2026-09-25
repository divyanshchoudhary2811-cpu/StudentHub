// ==========================================
// STUDENT HUB - BACKEND SERVER
// ==========================================


// ==========================================
// IMPORT PACKAGES
// ==========================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();


// ==========================================
// IMPORT MODELS
// ==========================================

const Student = require("./Models/Student");
const Admin = require("./Models/Admin");


// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();

const PORT = 5000;


// ==========================================
// CHECK ENVIRONMENT VARIABLES
// ==========================================

if (!process.env.MONGO_URI) {

    console.error(
        "ERROR: MONGO_URI is missing from .env"
    );

}


if (!process.env.JWT_SECRET) {

    console.error(
        "ERROR: JWT_SECRET is missing from .env"
    );

}


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose
    .connect(process.env.MONGO_URI)

    .then(function () {

        console.log(
            "MongoDB connected successfully!"
        );

    })

    .catch(function (error) {

        console.error(
            "MongoDB connection error:"
        );

        console.error(error);

    });


// ==========================================
// HOME / TEST ROUTE
// ==========================================

app.get(
    "/",
    function (req, res) {

        res.status(200).json({

            message:
                "StudentHub API is running"

        });

    }
);


// ==========================================
// JWT AUTHENTICATION MIDDLEWARE
// ==========================================

function authenticateToken(req, res, next) {


    // --------------------------------------
    // GET AUTHORIZATION HEADER
    // --------------------------------------

    const authHeader =
        req.headers.authorization;


    if (!authHeader) {

        return res.status(401).json({

            message:
                "Access denied. Please login."

        });

    }


    // --------------------------------------
    // CHECK BEARER TOKEN
    // --------------------------------------

    const parts =
        authHeader.split(" ");


    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {

        return res.status(401).json({

            message:
                "Invalid authorization format."

        });

    }


    const token =
        parts[1];


    // --------------------------------------
    // CHECK JWT SECRET
    // --------------------------------------

    if (!process.env.JWT_SECRET) {

        return res.status(500).json({

            message:
                "JWT secret is not configured."

        });

    }


    // --------------------------------------
    // VERIFY TOKEN
    // --------------------------------------

    jwt.verify(

        token,

        process.env.JWT_SECRET,

        function (error, decoded) {


            if (error) {

                return res.status(403).json({

                    message:
                        "Invalid or expired token."

                });

            }


            // Save decoded user information

            req.user =
                decoded;


            next();

        }

    );

}


// ==========================================
// ADMIN LOGIN
// ==========================================

app.post(
    "/api/auth/login",
    async function (req, res) {


        try {


            console.log(
                "Login request received."
            );


            // --------------------------------------
            // GET USERNAME AND PASSWORD
            // --------------------------------------

            const {
                username,
                password
            } = req.body;


            // --------------------------------------
            // VALIDATION
            // --------------------------------------

            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    message:
                        "Username and password are required."

                });

            }


            // --------------------------------------
            // FIND ADMIN
            // --------------------------------------

            const admin =
                await Admin.findOne({

                    username:
                        username.trim()

                });


            if (!admin) {

                console.log(
                    "Login failed: admin not found."
                );


                return res.status(401).json({

                    message:
                        "Invalid username or password."

                });

            }


            // --------------------------------------
            // CHECK PASSWORD
            // --------------------------------------

            const passwordMatch =
                await bcrypt.compare(

                    password,

                    admin.password

                );


            if (!passwordMatch) {

                console.log(
                    "Login failed: wrong password."
                );


                return res.status(401).json({

                    message:
                        "Invalid username or password."

                });

            }


            // --------------------------------------
            // CHECK JWT SECRET
            // --------------------------------------

            if (!process.env.JWT_SECRET) {

                return res.status(500).json({

                    message:
                        "JWT secret is not configured."

                });

            }


            // --------------------------------------
            // CREATE JWT TOKEN
            // --------------------------------------

            const token =
                jwt.sign(

                    {

                        id:
                            admin._id.toString(),

                        username:
                            admin.username

                    },

                    process.env.JWT_SECRET,

                    {

                        expiresIn:
                            "1d"

                    }

                );


            // --------------------------------------
            // LOGIN SUCCESS
            // --------------------------------------

            console.log(
                "Login successful for:",
                admin.username
            );


            return res.status(200).json({

                message:
                    "Login successful",

                token:
                    token,

                username:
                    admin.username

            });

        }


        catch (error) {


            console.error(
                "Login error:"
            );

            console.error(error);


            return res.status(500).json({

                message:
                    "Server error during login."

            });

        }

    }
);


// ==========================================
// GET ALL STUDENTS
// ==========================================

app.get(
    "/api/students",
    authenticateToken,
    async function (req, res) {


        try {


            const students =
                await Student.find()
                    .sort({

                        createdAt:
                            -1

                    });


            return res.status(200).json(
                students
            );

        }


        catch (error) {


            console.error(
                "Error fetching students:"
            );

            console.error(error);


            return res.status(500).json({

                message:
                    "Error fetching students."

            });

        }

    }
);


// ==========================================
// ADD STUDENT
// ==========================================

app.post(
    "/api/students",
    authenticateToken,
    async function (req, res) {


        try {


            const {
                name,
                studentId,
                course,
                grade
            } = req.body;


            // --------------------------------------
            // VALIDATE DATA
            // --------------------------------------

            if (
                !name ||
                !studentId ||
                !course ||
                !grade
            ) {

                return res.status(400).json({

                    message:
                        "All fields are required."

                });

            }


            // --------------------------------------
            // CLEAN DATA
            // --------------------------------------

            const cleanName =
                name.trim();

            const cleanStudentId =
                studentId.trim();

            const cleanCourse =
                course.trim();

            const cleanGrade =
                grade.trim();


            // --------------------------------------
            // CHECK DUPLICATE STUDENT ID
            // --------------------------------------

            const existingStudent =
                await Student.findOne({

                    studentId:
                        cleanStudentId

                });


            if (existingStudent) {

                return res.status(409).json({

                    message:
                        "Student ID already exists."

                });

            }


            // --------------------------------------
            // CREATE STUDENT
            // --------------------------------------

            const newStudent =
                await Student.create({

                    name:
                        cleanName,

                    studentId:
                        cleanStudentId,

                    course:
                        cleanCourse,

                    grade:
                        cleanGrade

                });


            console.log(
                "Student added:",
                cleanStudentId
            );


            return res.status(201).json(
                newStudent
            );

        }


        catch (error) {


            console.error(
                "Error adding student:"
            );

            console.error(error);


            // Duplicate key error

            if (
                error.code === 11000
            ) {

                return res.status(409).json({

                    message:
                        "Student ID already exists."

                });

            }


            // Validation error

            if (
                error.name ===
                "ValidationError"
            ) {

                return res.status(400).json({

                    message:
                        "Invalid student data."

                });

            }


            return res.status(500).json({

                message:
                    "Error adding student."

            });

        }

    }
);


// ==========================================
// UPDATE STUDENT
// ==========================================

app.put(
    "/api/students/:id",
    authenticateToken,
    async function (req, res) {


        try {


            const {
                name,
                studentId,
                course,
                grade
            } = req.body;


            // --------------------------------------
            // VALIDATE DATA
            // --------------------------------------

            if (
                !name ||
                !studentId ||
                !course ||
                !grade
            ) {

                return res.status(400).json({

                    message:
                        "All fields are required."

                });

            }


            // --------------------------------------
            // CLEAN DATA
            // --------------------------------------

            const cleanName =
                name.trim();

            const cleanStudentId =
                studentId.trim();

            const cleanCourse =
                course.trim();

            const cleanGrade =
                grade.trim();


            // --------------------------------------
            // CHECK DUPLICATE STUDENT ID
            // --------------------------------------

            const existingStudent =
                await Student.findOne({

                    studentId:
                        cleanStudentId,

                    _id: {
                        $ne:
                            req.params.id
                    }

                });


            if (existingStudent) {

                return res.status(409).json({

                    message:
                        "Student ID already exists."

                });

            }


            // --------------------------------------
            // UPDATE STUDENT
            // --------------------------------------

            const updatedStudent =
                await Student.findByIdAndUpdate(

                    req.params.id,

                    {

                        name:
                            cleanName,

                        studentId:
                            cleanStudentId,

                        course:
                            cleanCourse,

                        grade:
                            cleanGrade

                    },

                    {

                        new:
                            true,

                        runValidators:
                            true

                    }

                );


            // --------------------------------------
            // STUDENT NOT FOUND
            // --------------------------------------

            if (!updatedStudent) {

                return res.status(404).json({

                    message:
                        "Student not found."

                });

            }


            console.log(
                "Student updated:",
                cleanStudentId
            );


            return res.status(200).json(
                updatedStudent
            );

        }


        catch (error) {


            console.error(
                "Error updating student:"
            );

            console.error(error);


            // Invalid MongoDB ID

            if (
                error.name ===
                "CastError"
            ) {

                return res.status(400).json({

                    message:
                        "Invalid student ID."

                });

            }


            // Duplicate student ID

            if (
                error.code === 11000
            ) {

                return res.status(409).json({

                    message:
                        "Student ID already exists."

                });

            }


            // Validation error

            if (
                error.name ===
                "ValidationError"
            ) {

                return res.status(400).json({

                    message:
                        "Invalid student data."

                });

            }


            return res.status(500).json({

                message:
                    "Error updating student."

            });

        }

    }
);


// ==========================================
// DELETE STUDENT
// ==========================================

app.delete(
    "/api/students/:id",
    authenticateToken,
    async function (req, res) {


        try {


            // --------------------------------------
            // DELETE STUDENT
            // --------------------------------------

            const deletedStudent =
                await Student.findByIdAndDelete(

                    req.params.id

                );


            // --------------------------------------
            // STUDENT NOT FOUND
            // --------------------------------------

            if (!deletedStudent) {

                return res.status(404).json({

                    message:
                        "Student not found."

                });

            }


            console.log(
                "Student deleted:",
                deletedStudent.studentId
            );


            return res.status(200).json({

                message:
                    "Student deleted successfully."

            });

        }


        catch (error) {


            console.error(
                "Error deleting student:"
            );

            console.error(error);


            // Invalid MongoDB ID

            if (
                error.name ===
                "CastError"
            ) {

                return res.status(400).json({

                    message:
                        "Invalid student ID."

                });

            }


            return res.status(500).json({

                message:
                    "Error deleting student."

            });

        }

    }
);


// ==========================================
// 404 ROUTE
// ==========================================

app.use(
    function (req, res) {

        return res.status(404).json({

            message:
                "API route not found."

        });

    }
);


// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
    function (error, req, res, next) {

        console.error(
            "Unexpected server error:"
        );

        console.error(error);


        return res.status(500).json({

            message:
                "Internal server error."

        });

    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(

    PORT,

    function () {

        console.log(
            "=========================================="
        );

        console.log(
            "       STUDENT HUB BACKEND SERVER"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `Server is running on http://localhost:${PORT}`
        );

        console.log(
            "Waiting for requests..."
        );

        console.log(
            "=========================================="
        );

    }

);