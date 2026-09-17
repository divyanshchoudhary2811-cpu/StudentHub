// ==========================================
// STUDENT HUB - BACKEND SERVER
// ==========================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Student = require("./Models/Student");

const app = express();

const PORT = 5000;


// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose.connect(process.env.MONGO_URI)
    .then(function () {

        console.log(
            "MongoDB connected successfully!"
        );

    })
    .catch(function (error) {

        console.log(
            "MongoDB connection error:",
            error
        );

    });


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// GET - GET ALL STUDENTS
// ==========================================

app.get(
    "/api/students",
    async function (req, res) {

        try {

            const students =
                await Student.find();

            res.json(students);

        } catch (error) {

            console.log(
                "Error fetching students:",
                error
            );

            res.status(500).json({

                message:
                    "Error fetching students"

            });

        }

    }
);


// ==========================================
// POST - ADD NEW STUDENT
// ==========================================

app.post(
    "/api/students",
    async function (req, res) {

        try {

            const newStudent =
                await Student.create({

                    name:
                        req.body.name,

                    studentId:
                        req.body.studentId,

                    course:
                        req.body.course,

                    grade:
                        req.body.grade

                });


            res.status(201).json(
                newStudent
            );

        } catch (error) {

            console.log(
                "Error adding student:",
                error
            );

            res.status(500).json({

                message:
                    "Error adding student"

            });

        }

    }
);


// ==========================================
// DELETE - DELETE STUDENT
// ==========================================

app.delete(
    "/api/students/:id",
    async function (req, res) {

        try {

            const deletedStudent =
                await Student.findByIdAndDelete(
                    req.params.id
                );


            if (!deletedStudent) {

                return res.status(404).json({

                    message:
                        "Student not found"

                });

            }


            res.json({

                message:
                    "Student deleted successfully"

            });

        } catch (error) {

            console.log(
                "Error deleting student:",
                error
            );

            res.status(500).json({

                message:
                    "Error deleting student"

            });

        }

    }
);


// ==========================================
// PUT - UPDATE STUDENT
// ==========================================

app.put(
    "/api/students/:id",
    async function (req, res) {

        try {

            const updatedStudent =
                await Student.findByIdAndUpdate(

                    req.params.id,

                    {

                        name:
                            req.body.name,

                        studentId:
                            req.body.studentId,

                        course:
                            req.body.course,

                        grade:
                            req.body.grade

                    },

                    {

                        returnDocument: "after",

                        runValidators: true

                    }

                );


            if (!updatedStudent) {

                return res.status(404).json({

                    message:
                        "Student not found"

                });

            }


            res.json(
                updatedStudent
            );

        } catch (error) {

            console.log(
                "Error updating student:",
                error
            );

            res.status(500).json({

                message:
                    "Error updating student"

            });

        }

    }
);


// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    function () {

        console.log(
            `Server is running on http://localhost:${PORT}`
        );

    }
);