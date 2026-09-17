const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    studentId: {
        type: String,
        required: true
    },

    course: {
        type: String,
        required: true
    },

    grade: {
        type: String,
        required: true
    }

});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;