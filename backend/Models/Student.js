const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        studentId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        course: {
            type: String,
            required: true,
            trim: true
        },

        grade: {
            type: String,
            required: true,
            enum: ["A+", "A", "B+", "B", "C"]
        }
    },

    {
        timestamps: true
    }
);

const Student =
    mongoose.model("Student", studentSchema);

module.exports = Student;