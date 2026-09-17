// ==========================================
// STUDENT HUB - FRONTEND JAVASCRIPT
// ==========================================

const API_URL = "http://localhost:5000/api/students";


// ==========================================
// 1. LOAD STUDENTS
// ==========================================

async function loadStudents() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        const students = await response.json();

        // Update dashboard statistics
        updateDashboardStats(students);

        const tableBody =
            document.getElementById("studentTableBody");

        if (!tableBody) {
            console.error("studentTableBody not found");
            return;
        }

        tableBody.innerHTML = "";

        students.forEach(function (student) {

            const row = document.createElement("tr");

            // Store MongoDB ID
            row.dataset.id = student._id;

            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.studentId}</td>
                <td>${student.course}</td>
                <td>${student.grade}</td>

                <td>
                    <button class="edit-btn">
                        Edit
                    </button>

                    <button class="delete-btn">
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);

        });

        console.log("Students loaded successfully");

    } catch (error) {

        console.error("Error loading students:", error);

    }

}


// ==========================================
// 2. ADD STUDENT
// ==========================================

async function addStudent(event) {

    event.preventDefault();

    console.log("Add Student button clicked");

    const name =
        document.getElementById("studentName").value.trim();

    const studentId =
        document.getElementById("studentId").value.trim();

    const course =
        document.getElementById("course").value.trim();

    const grade =
        document.getElementById("grade").value.trim();


    if (!name || !studentId || !course || !grade) {

        alert("Please fill all fields.");

        return;
    }


    const studentData = {

        name: name,

        studentId: studentId,

        course: course,

        grade: grade

    };


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(studentData)

        });


        if (!response.ok) {

            const errorData =
                await response.json();

            console.error(errorData);

            throw new Error("Failed to add student");

        }


        const newStudent =
            await response.json();

        console.log("Student added:", newStudent);


        document.getElementById("studentForm").reset();


        await loadStudents();


        alert("Student added successfully!");


    } catch (error) {

        console.error("Add student error:", error);

        alert(
            "Could not add student. Make sure the backend is running."
        );

    }

}


// ==========================================
// 3. SEARCH STUDENTS
// ==========================================

function searchStudents() {

    const searchInput =
        document.getElementById("searchInput");

    const searchText =
        searchInput.value.toLowerCase();

    const rows =
        document.querySelectorAll(
            "#studentTableBody tr"
        );


    rows.forEach(function (row) {

        const rowText =
            row.textContent.toLowerCase();

        if (rowText.includes(searchText)) {

            row.style.display = "";

        } else {

            row.style.display = "none";

        }

    });

}


// ==========================================
// 4. DELETE STUDENT
// ==========================================

async function deleteStudent(row) {

    const mongoId =
        row.dataset.id;


    if (!mongoId) {

        alert("Student ID not found.");

        return;

    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this student?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/${mongoId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to delete student"
            );

        }


        await loadStudents();


        alert(
            "Student deleted successfully!"
        );


    } catch (error) {

        console.error(
            "Delete student error:",
            error
        );


        alert(
            "Could not delete student."
        );

    }

}


// ==========================================
// 5. EDIT STUDENT
// ==========================================

async function editStudent(row) {

    const mongoId =
        row.dataset.id;


    if (!mongoId) {

        alert("Student ID not found.");

        return;

    }


    const currentName =
        row.cells[0].textContent;

    const currentStudentId =
        row.cells[1].textContent;

    const currentCourse =
        row.cells[2].textContent;

    const currentGrade =
        row.cells[3].textContent;


    const name =
        prompt(
            "Enter student name:",
            currentName
        );


    if (name === null) {
        return;
    }


    const studentId =
        prompt(
            "Enter student ID:",
            currentStudentId
        );


    if (studentId === null) {
        return;
    }


    const course =
        prompt(
            "Enter course:",
            currentCourse
        );


    if (course === null) {
        return;
    }


    const grade =
        prompt(
            "Enter grade:",
            currentGrade
        );


    if (grade === null) {
        return;
    }


    if (
        !name.trim() ||
        !studentId.trim() ||
        !course.trim() ||
        !grade.trim()
    ) {

        alert("All fields are required.");

        return;

    }


    const updatedData = {

        name: name.trim(),

        studentId: studentId.trim(),

        course: course.trim(),

        grade: grade.trim()

    };


    try {

        const response =
            await fetch(
                `${API_URL}/${mongoId}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(updatedData)

                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to update student"
            );

        }


        const updatedStudent =
            await response.json();


        console.log(
            "Student updated:",
            updatedStudent
        );


        await loadStudents();


        alert(
            "Student updated successfully!"
        );


    } catch (error) {

        console.error(
            "Edit student error:",
            error
        );


        alert(
            "Could not update student."
        );

    }

}


// ==========================================
// 6. TABLE BUTTONS
// ==========================================

function setupTableButtons() {

    const tableBody =
        document.getElementById(
            "studentTableBody"
        );


    if (!tableBody) {

        console.error(
            "studentTableBody not found"
        );

        return;

    }


    tableBody.addEventListener(
        "click",
        async function (event) {

            const row =
                event.target.closest("tr");


            if (!row) {
                return;
            }


            // DELETE
            if (
                event.target.classList.contains(
                    "delete-btn"
                )
            ) {

                await deleteStudent(row);

            }


            // EDIT
            if (
                event.target.classList.contains(
                    "edit-btn"
                )
            ) {

                await editStudent(row);

            }

        }
    );

}


// ==========================================
// 7. DASHBOARD STATISTICS
// ==========================================

function updateDashboardStats(students) {

    // Total students
    document.getElementById("totalStudents").textContent =
        students.length;


    // Active students
    // Currently every student is considered active
    document.getElementById("activeStudents").textContent =
        students.length;


    // Unique courses
    const courses = new Set(
        students.map(function (student) {
            return student.course;
        })
    );


    document.getElementById("totalCourses").textContent =
        courses.size;


    // Average grade
    if (students.length === 0) {

        document.getElementById("averageGrade").textContent =
            "-";

        return;

    }


    const gradePoints = {

        "A+": 4,
        "A": 3.7,
        "B+": 3.3,
        "B": 3,
        "C": 2

    };


    let totalPoints = 0;


    students.forEach(function (student) {

        totalPoints +=
            gradePoints[student.grade] || 0;

    });


    const average =
        totalPoints / students.length;


    let averageGrade;


    if (average >= 3.85) {

        averageGrade = "A+";

    } else if (average >= 3.5) {

        averageGrade = "A";

    } else if (average >= 3.15) {

        averageGrade = "B+";

    } else if (average >= 2.5) {

        averageGrade = "B";

    } else {

        averageGrade = "C";

    }


    document.getElementById("averageGrade").textContent =
        averageGrade;

}


// ==========================================
// 8. START APPLICATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "StudentHub JavaScript loaded"
        );


        // Add Student form
        const studentForm =
            document.getElementById(
                "studentForm"
            );


        if (studentForm) {

            studentForm.addEventListener(
                "submit",
                addStudent
            );

        } else {

            console.error(
                "studentForm not found"
            );

        }


        // Search
        const searchInput =
            document.getElementById(
                "searchInput"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchStudents
            );

        }


        // Edit/Delete buttons
        setupTableButtons();


        // Load students
        loadStudents();

    }
);