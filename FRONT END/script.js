// ==========================================
// STUDENT HUB - FRONTEND JAVASCRIPT
// ==========================================

const API_URL =
    "https://studenthub-api-2811.onrender.com/api/students";

// ==========================================
// GLOBAL VARIABLES
// ==========================================

let allStudents = [];

let filteredStudents = [];

let currentPage = 1;

let pageSize = 5;

let courseChart = null;

let gradeChart = null;

let selectedProfileStudent = null;


// ==========================================
// DOM CONTENT LOADED
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Check login first
        checkLogin();

        loadStudents();

        setupNavigation();

        setupAddStudent();

        setupFilters();

        setupEditModal();

        setupProfileModal();

        setupThemeToggle();

        setupExport();

        setupLogout();

    }
);


// ==========================================
// CHECK LOGIN
// ==========================================

function checkLogin() {

    const loggedIn =
        sessionStorage.getItem(
            "studenthubLoggedIn"
        );

    const token =
        sessionStorage.getItem(
            "studenthubToken"
        );


    if (
        loggedIn !== "true" ||
        !token
    ) {

        window.location.href =
            "login.html";

    }

}


// ==========================================
// GET AUTH HEADERS
// ==========================================

function getAuthHeaders() {

    const token =
        sessionStorage.getItem(
            "studenthubToken"
        );


    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`

    };

}


// ==========================================
// HANDLE UNAUTHORIZED
// ==========================================

function handleUnauthorized() {

    sessionStorage.removeItem(
        "studenthubLoggedIn"
    );

    sessionStorage.removeItem(
        "studenthubToken"
    );

    sessionStorage.removeItem(
        "studenthubUsername"
    );


    window.location.href =
        "login.html";

}


// ==========================================
// TOAST NOTIFICATION
// ==========================================

function showToast(
    message,
    type = "success"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    if (!container) return;


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.textContent =
        message;


    container.appendChild(
        toast
    );


    setTimeout(
        function () {

            toast.classList.add(
                "hide"
            );


            setTimeout(
                function () {

                    toast.remove();

                },
                300
            );

        },
        3000
    );

}


// ==========================================
// LOADING STATE
// ==========================================

function setLoading(isLoading) {

    const loadingState =
        document.getElementById(
            "loadingState"
        );


    if (!loadingState) return;


    loadingState.style.display =
        isLoading
            ? "block"
            : "none";

}


// ==========================================
// LOAD STUDENTS
// ==========================================

async function loadStudents() {

    setLoading(true);


    try {

        const response =
            await fetch(
                API_URL,
                {

                    method: "GET",

                    headers:
                        getAuthHeaders()

                }
            );


        // Token expired / unauthorized

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleUnauthorized();

            return;

        }


        const responseText =
            await response.text();


        let data = [];


        try {

            data =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : [];

        } catch {

            data = [];

        }


        if (!response.ok) {

            throw new Error(

                data.message ||
                "Failed to load students"

            );

        }


        allStudents =
            Array.isArray(data)
                ? data
                : [];


        filteredStudents =
            [...allStudents];


        currentPage = 1;


        populateCourseFilter();

        applyFilters();

        updateDashboard();

        updateReports();


    } catch (error) {

        console.error(
            "Load students error:",
            error
        );


        showToast(

            error.message ||
            "Unable to load students.",

            "error"

        );

    } finally {

        setLoading(false);

    }

}


// ==========================================
// ADD STUDENT
// ==========================================

async function addStudent(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "studentName"
        ).value.trim();


    const studentId =
        document.getElementById(
            "studentId"
        ).value.trim();


    const course =
        document.getElementById(
            "course"
        ).value.trim();


    const grade =
        document.getElementById(
            "grade"
        ).value;


    if (
        !name ||
        !studentId ||
        !course ||
        !grade
    ) {

        showToast(
            "Please fill all fields.",
            "error"
        );

        return;

    }


    const saveButton =
        document.getElementById(
            "saveStudentBtn"
        );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "Saving...";

    }


    try {

        const response =
            await fetch(
                API_URL,
                {

                    method: "POST",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify({

                            name:
                                name,

                            studentId:
                                studentId,

                            course:
                                course,

                            grade:
                                grade

                        })

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleUnauthorized();

            return;

        }


        const responseText =
            await response.text();


        let data = {};


        try {

            data =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch {

            data = {};

        }


        if (!response.ok) {

            throw new Error(

                data.message ||
                "Failed to add student"

            );

        }


        showToast(
            "Student added successfully!",
            "success"
        );


        document
            .getElementById(
                "studentForm"
            )
            .reset();


        await loadStudents();


        showSection(
            "students"
        );


    } catch (error) {

        console.error(
            "Add student error:",
            error
        );


        showToast(

            error.message ||
            "Unable to add student.",

            "error"

        );

    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save Student";

        }

    }

}


// ==========================================
// POPULATE COURSE FILTER
// ==========================================

function populateCourseFilter() {

    const courseFilter =
        document.getElementById(
            "courseFilter"
        );


    if (!courseFilter) return;


    const currentValue =
        courseFilter.value;


    const courses =
        [
            ...new Set(

                allStudents

                    .map(
                        student =>
                            student.course
                    )

                    .filter(Boolean)

            )
        ].sort();


    courseFilter.innerHTML =
        `<option value="">
            All Courses
        </option>`;


    courses.forEach(
        function (course) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                course;


            option.textContent =
                course;


            courseFilter.appendChild(
                option
            );

        }
    );


    courseFilter.value =
        currentValue;

}


// ==========================================
// APPLY FILTERS
// ==========================================

function applyFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const courseFilter =
        document.getElementById(
            "courseFilter"
        );


    const gradeFilter =
        document.getElementById(
            "gradeFilter"
        );


    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const course =
        courseFilter
            ? courseFilter.value
            : "";


    const grade =
        gradeFilter
            ? gradeFilter.value
            : "";


    filteredStudents =
        allStudents.filter(
            function (student) {

                const matchesSearch =

                    !search ||

                    String(
                        student.name || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        student.studentId || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        student.course || ""
                    )
                        .toLowerCase()
                        .includes(search);


                const matchesCourse =
                    !course ||
                    student.course ===
                        course;


                const matchesGrade =
                    !grade ||
                    student.grade ===
                        grade;


                return (
                    matchesSearch &&
                    matchesCourse &&
                    matchesGrade
                );

            }
        );


    sortStudents(
        sortSelect
            ? sortSelect.value
            : "newest"
    );


    currentPage = 1;


    renderStudents();

    renderPagination();

}


// ==========================================
// SORT STUDENTS
// ==========================================

function sortStudents(
    sortValue
) {

    if (!sortValue) return;


    filteredStudents.sort(
        function (a, b) {

            switch (sortValue) {

                case "name-asc":

                    return String(
                        a.name
                    ).localeCompare(
                        String(
                            b.name
                        )
                    );


                case "name-desc":

                    return String(
                        b.name
                    ).localeCompare(
                        String(
                            a.name
                        )
                    );


                case "grade-asc":

                    return (
                        getGradeValue(
                            a.grade
                        )
                        -
                        getGradeValue(
                            b.grade
                        )
                    );


                case "grade-desc":

                    return (
                        getGradeValue(
                            b.grade
                        )
                        -
                        getGradeValue(
                            a.grade
                        )
                    );


                case "oldest":

                    return (
                        new Date(
                            a.createdAt
                        )
                        -
                        new Date(
                            b.createdAt
                        )
                    );


                case "newest":

                default:

                    return (
                        new Date(
                            b.createdAt
                        )
                        -
                        new Date(
                            a.createdAt
                        )
                    );

            }

        }
    );

}


// ==========================================
// GRADE VALUE
// ==========================================

function getGradeValue(
    grade
) {

    const grades = {

        "A+": 5,

        "A": 4,

        "B+": 3,

        "B": 2,

        "C": 1

    };


    return grades[grade] || 0;

}


// ==========================================
// RENDER STUDENTS
// ==========================================

function renderStudents() {

    const tableBody =
        document.getElementById(
            "studentTableBody"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (!tableBody) return;


    tableBody.innerHTML = "";


    if (
        filteredStudents.length ===
        0
    ) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    const start =
        (
            currentPage - 1
        ) * pageSize;


    const end =
        start + pageSize;


    const pageStudents =
        filteredStudents.slice(
            start,
            end
        );


    pageStudents.forEach(
        function (student) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        student.name
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        student.studentId
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        student.course
                    )}
                </td>

                <td>
                    <span class="grade-badge">
                        ${escapeHtml(
                            student.grade
                        )}
                    </span>
                </td>

                <td>
                    ${formatDate(
                        student.createdAt
                    )}
                </td>

                <td>

                    <button
                        class="view-btn"
                        data-id="${
                            student._id
                        }">

                        View

                    </button>


                    <button
                        class="edit-btn"
                        data-id="${
                            student._id
                        }">

                        Edit

                    </button>


                    <button
                        class="delete-btn"
                        data-id="${
                            student._id
                        }">

                        Delete

                    </button>

                </td>

            `;


            tableBody.appendChild(
                row
            );

        }
    );


    setupTableButtons();

}


// ==========================================
// TABLE BUTTONS
// ==========================================

function setupTableButtons() {

    const viewButtons =
        document.querySelectorAll(
            ".view-btn"
        );


    const editButtons =
        document.querySelectorAll(
            ".edit-btn"
        );


    const deleteButtons =
        document.querySelectorAll(
            ".delete-btn"
        );


    viewButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    viewStudentProfile(
                        this.dataset.id
                    );

                }
            );

        }
    );


    editButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    editStudent(
                        this.dataset.id
                    );

                }
            );

        }
    );


    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    deleteStudent(
                        this.dataset.id
                    );

                }
            );

        }
    );

}


// ==========================================
// PAGINATION
// ==========================================

function renderPagination() {

    const paginationControls =
        document.getElementById(
            "paginationControls"
        );


    const paginationInfo =
        document.getElementById(
            "paginationInfo"
        );


    if (
        !paginationControls ||
        !paginationInfo
    ) {

        return;

    }


    const total =
        filteredStudents.length;


    const totalPages =
        Math.ceil(
            total / pageSize
        );


    if (total === 0) {

        paginationInfo.textContent =
            "No students found";


        paginationControls.innerHTML =
            "";


        return;

    }


    const start =
        (
            currentPage - 1
        ) * pageSize + 1;


    const end =
        Math.min(
            currentPage * pageSize,
            total
        );


    paginationInfo.textContent =
        `Showing ${start}-${end} of ${total} students`;


    paginationControls.innerHTML =
        "";


    if (totalPages <= 1) {

        return;

    }


    const previousButton =
        document.createElement(
            "button"
        );


    previousButton.textContent =
        "Previous";


    previousButton.disabled =
        currentPage === 1;


    previousButton.addEventListener(
        "click",
        function () {

            if (
                currentPage > 1
            ) {

                currentPage--;

                renderStudents();

                renderPagination();

            }

        }
    );


    paginationControls.appendChild(
        previousButton
    );


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        const pageButton =
            document.createElement(
                "button"
            );


        pageButton.textContent =
            page;


        if (
            page === currentPage
        ) {

            pageButton.classList.add(
                "active"
            );

        }


        pageButton.addEventListener(
            "click",
            function () {

                currentPage =
                    page;


                renderStudents();

                renderPagination();

            }
        );


        paginationControls.appendChild(
            pageButton
        );

    }


    const nextButton =
        document.createElement(
            "button"
        );


    nextButton.textContent =
        "Next";


    nextButton.disabled =
        currentPage ===
        totalPages;


    nextButton.addEventListener(
        "click",
        function () {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                renderStudents();

                renderPagination();

            }

        }
    );


    paginationControls.appendChild(
        nextButton
    );

}


// ==========================================
// CLEAR FILTERS
// ==========================================

function clearFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const courseFilter =
        document.getElementById(
            "courseFilter"
        );


    const gradeFilter =
        document.getElementById(
            "gradeFilter"
        );


    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    if (searchInput) {

        searchInput.value =
            "";

    }


    if (courseFilter) {

        courseFilter.value =
            "";

    }


    if (gradeFilter) {

        gradeFilter.value =
            "";

    }


    if (sortSelect) {

        sortSelect.value =
            "newest";

    }


    currentPage = 1;


    applyFilters();

}


// ==========================================
// DELETE STUDENT
// ==========================================

async function deleteStudent(
    id
) {

    const student =
        allStudents.find(
            student =>
                student._id === id
        );


    if (!student) {

        showToast(
            "Student not found.",
            "error"
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete ${student.name}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {

                    method: "DELETE",

                    headers:
                        getAuthHeaders()

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleUnauthorized();

            return;

        }


        const responseText =
            await response.text();


        let data = {};


        try {

            data =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch {

            data = {};

        }


        if (!response.ok) {

            throw new Error(

                data.message ||
                "Failed to delete student"

            );

        }


        showToast(
            "Student deleted successfully!",
            "success"
        );


        if (
            selectedProfileStudent &&
            selectedProfileStudent._id === id
        ) {

            closeProfileModal();

        }


        await loadStudents();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        showToast(

            error.message ||
            "Unable to delete student.",

            "error"

        );

    }

}


// ==========================================
// EDIT STUDENT
// ==========================================

function editStudent(id) {

    const student =
        allStudents.find(
            student =>
                student._id === id
        );


    if (!student) {

        showToast(
            "Student not found.",
            "error"
        );

        return;

    }


    const modal =
        document.getElementById(
            "editModal"
        );


    if (!modal) return;


    document.getElementById(
        "editMongoId"
    ).value =
        student._id;


    document.getElementById(
        "editStudentName"
    ).value =
        student.name;


    document.getElementById(
        "editStudentId"
    ).value =
        student.studentId;


    document.getElementById(
        "editCourse"
    ).value =
        student.course;


    document.getElementById(
        "editGrade"
    ).value =
        student.grade;


    modal.style.display =
        "flex";

}


// ==========================================
// UPDATE STUDENT
// ==========================================

async function updateStudent(
    event
) {

    event.preventDefault();


    console.log(
        "Update button clicked"
    );


    const mongoId =
        document.getElementById(
            "editMongoId"
        ).value;


    if (!mongoId) {

        showToast(
            "Student ID is missing.",
            "error"
        );

        return;

    }


    const name =
        document.getElementById(
            "editStudentName"
        ).value.trim();


    const studentId =
        document.getElementById(
            "editStudentId"
        ).value.trim();


    const course =
        document.getElementById(
            "editCourse"
        ).value.trim();


    const grade =
        document.getElementById(
            "editGrade"
        ).value;


    if (
        !name ||
        !studentId ||
        !course ||
        !grade
    ) {

        showToast(
            "Please fill all fields.",
            "error"
        );

        return;

    }


    const updateButton =
        document.getElementById(
            "updateStudentBtn"
        );


    if (updateButton) {

        updateButton.disabled =
            true;

        updateButton.textContent =
            "Updating...";

    }


    try {

        console.log(
            "Updating student:",
            mongoId
        );


        const response =
            await fetch(
                `${API_URL}/${mongoId}`,
                {

                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify({

                            name:
                                name,

                            studentId:
                                studentId,

                            course:
                                course,

                            grade:
                                grade

                        })

                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleUnauthorized();

            return;

        }


        const responseText =
            await response.text();


        console.log(
            "Server response:",
            responseText
        );


        let data = {};


        try {

            data =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch {

            data = {};

        }


        if (!response.ok) {

            throw new Error(

                data.message ||
                `Update failed (${response.status})`

            );

        }


        showToast(
            "Student updated successfully!",
            "success"
        );


        closeEditModal();


        await loadStudents();


    } catch (error) {

        console.error(
            "Update student error:",
            error
        );


        showToast(

            error.message ||
            "Unable to update student.",

            "error"

        );

    } finally {

        if (updateButton) {

            updateButton.disabled =
                false;

            updateButton.textContent =
                "Update Student";

        }

    }

}


// ==========================================
// VIEW STUDENT PROFILE
// ==========================================

function viewStudentProfile(
    id
) {

    const student =
        allStudents.find(
            student =>
                student._id === id
        );


    if (!student) {

        showToast(
            "Student not found.",
            "error"
        );

        return;

    }


    selectedProfileStudent =
        student;


    const modal =
        document.getElementById(
            "profileModal"
        );


    if (!modal) return;


    const avatar =
        document.getElementById(
            "profileAvatar"
        );


    const name =
        document.getElementById(
            "profileName"
        );


    const studentId =
        document.getElementById(
            "profileStudentId"
        );


    const course =
        document.getElementById(
            "profileCourse"
        );


    const grade =
        document.getElementById(
            "profileGrade"
        );


    const createdAt =
        document.getElementById(
            "profileCreatedAt"
        );


    if (avatar) {

        avatar.textContent =
            getInitials(
                student.name
            );

    }


    if (name) {

        name.textContent =
            student.name;

    }


    if (studentId) {

        studentId.textContent =
            student.studentId;

    }


    if (course) {

        course.textContent =
            student.course;

    }


    if (grade) {

        grade.textContent =
            student.grade;

    }


    if (createdAt) {

        createdAt.textContent =
            formatDate(
                student.createdAt
            );

    }


    modal.style.display =
        "flex";

}


// ==========================================
// GET INITIALS
// ==========================================

function getInitials(name) {

    if (!name) {

        return "?";

    }


    const words =
        name
            .trim()
            .split(/\s+/);


    if (
        words.length === 1
    ) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (

        words[0][0] +

        words[
            words.length - 1
        ][0]

    ).toUpperCase();

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(
            dateString
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }
    );

}


// ==========================================
// CLOSE PROFILE MODAL
// ==========================================

function closeProfileModal() {

    const modal =
        document.getElementById(
            "profileModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    selectedProfileStudent =
        null;

}


// ==========================================
// EDIT FROM PROFILE
// ==========================================

function editFromProfile() {

    if (!selectedProfileStudent) {

        return;

    }


    const id =
        selectedProfileStudent._id;


    closeProfileModal();


    editStudent(id);

}


// ==========================================
// DELETE FROM PROFILE
// ==========================================

async function deleteFromProfile() {

    if (!selectedProfileStudent) {

        return;

    }


    const id =
        selectedProfileStudent._id;


    await deleteStudent(id);

}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    const totalStudents =
        document.getElementById(
            "totalStudents"
        );


    const activeStudents =
        document.getElementById(
            "activeStudents"
        );


    const totalCourses =
        document.getElementById(
            "totalCourses"
        );


    const averageGrade =
        document.getElementById(
            "averageGrade"
        );


    const total =
        allStudents.length;


    const courses =
        new Set(

            allStudents.map(
                student =>
                    student.course
            )

        );


    if (totalStudents) {

        totalStudents.textContent =
            total;

    }


    if (activeStudents) {

        activeStudents.textContent =
            total;

    }


    if (totalCourses) {

        totalCourses.textContent =
            courses.size;

    }


    if (averageGrade) {

        if (total === 0) {

            averageGrade.textContent =
                "-";

        } else {

            let totalGrade = 0;


            allStudents.forEach(
                function (student) {

                    totalGrade +=
                        getGradeValue(
                            student.grade
                        );

                }
            );


            averageGrade.textContent =
                (
                    totalGrade /
                    total
                ).toFixed(1);

        }

    }

}


// ==========================================
// REPORTS
// ==========================================

function updateReports() {

    updateReportSummary();

    updateCourseReport();

    updateGradeReport();

    updateCharts();

}


// ==========================================
// REPORT SUMMARY
// ==========================================

function updateReportSummary() {

    const totalStudents =
        document.getElementById(
            "reportTotalStudents"
        );


    const totalCourses =
        document.getElementById(
            "reportTotalCourses"
        );


    const averageGrade =
        document.getElementById(
            "reportAverageGrade"
        );


    const total =
        allStudents.length;


    const courses =
        new Set(

            allStudents.map(
                student =>
                    student.course
            )

        );


    if (totalStudents) {

        totalStudents.textContent =
            total;

    }


    if (totalCourses) {

        totalCourses.textContent =
            courses.size;

    }


    if (averageGrade) {

        if (total === 0) {

            averageGrade.textContent =
                "-";

        } else {

            let sum = 0;


            allStudents.forEach(
                function (student) {

                    sum +=
                        getGradeValue(
                            student.grade
                        );

                }
            );


            averageGrade.textContent =
                (
                    sum / total
                ).toFixed(2);

        }

    }

}


// ==========================================
// COURSE REPORT
// ==========================================

function updateCourseReport() {

    const body =
        document.getElementById(
            "courseReportBody"
        );


    if (!body) return;


    body.innerHTML =
        "";


    const courseCounts = {};


    allStudents.forEach(
        function (student) {

            const course =
                student.course ||
                "Unknown";


            if (
                !courseCounts[
                    course
                ]
            ) {

                courseCounts[
                    course
                ] = 0;

            }


            courseCounts[
                course
            ]++;

        }
    );


    Object.entries(
        courseCounts
    )

        .sort(
            (a, b) =>
                b[1] - a[1]
        )

        .forEach(
            function (
                [
                    course,
                    count
                ]
            ) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            course
                        )}
                    </td>

                    <td>
                        ${count}
                    </td>

                `;


                body.appendChild(
                    row
                );

            }
        );

}


// ==========================================
// GRADE REPORT
// ==========================================

function updateGradeReport() {

    const body =
        document.getElementById(
            "gradeReportBody"
        );


    if (!body) return;


    body.innerHTML =
        "";


    const gradeCounts = {

        "A+": 0,

        "A": 0,

        "B+": 0,

        "B": 0,

        "C": 0

    };


    allStudents.forEach(
        function (student) {

            if (
                gradeCounts[
                    student.grade
                ] !== undefined
            ) {

                gradeCounts[
                    student.grade
                ]++;

            }

        }
    );


    Object.entries(
        gradeCounts
    ).forEach(
        function (
            [
                grade,
                count
            ]
        ) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${grade}
                </td>

                <td>
                    ${count}
                </td>

            `;


            body.appendChild(
                row
            );

        }
    );

}


// ==========================================
// CHARTS
// ==========================================

function updateCharts() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "Chart.js not loaded"
        );

        return;

    }


    updateCourseChart();

    updateGradeChart();

}


// ==========================================
// COURSE CHART
// ==========================================

function updateCourseChart() {

    const canvas =
        document.getElementById(
            "courseChart"
        );


    if (!canvas) return;


    const counts = {};


    allStudents.forEach(
        function (student) {

            const course =
                student.course ||
                "Unknown";


            counts[course] =
                (
                    counts[course] ||
                    0
                ) + 1;

        }
    );


    if (courseChart) {

        courseChart.destroy();

    }


    courseChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        Object.keys(
                            counts
                        ),

                    datasets: [

                        {

                            label:
                                "Students",

                            data:
                                Object.values(
                                    counts
                                )

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );

}


// ==========================================
// GRADE CHART
// ==========================================

function updateGradeChart() {

    const canvas =
        document.getElementById(
            "gradeChart"
        );


    if (!canvas) return;


    const gradeCounts = {

        "A+": 0,

        "A": 0,

        "B+": 0,

        "B": 0,

        "C": 0

    };


    allStudents.forEach(
        function (student) {

            if (
                gradeCounts[
                    student.grade
                ] !== undefined
            ) {

                gradeCounts[
                    student.grade
                ]++;

            }

        }
    );


    if (gradeChart) {

        gradeChart.destroy();

    }


    gradeChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        Object.keys(
                            gradeCounts
                        ),

                    datasets: [

                        {

                            label:
                                "Grades",

                            data:
                                Object.values(
                                    gradeCounts
                                )

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false

                }

            }
        );

}


// ==========================================
// EXPORT REPORT
// ==========================================

function exportReport() {

    if (
        allStudents.length ===
        0
    ) {

        showToast(
            "No students available to export.",
            "error"
        );

        return;

    }


    const headers = [

        "Name",

        "Student ID",

        "Course",

        "Grade",

        "Added On"

    ];


    const rows =
        allStudents.map(
            function (student) {

                return [

                    student.name,

                    student.studentId,

                    student.course,

                    student.grade,

                    formatDate(
                        student.createdAt
                    )

                ];

            }
        );


    const csvRows = [];


    csvRows.push(
        headers.join(",")
    );


    rows.forEach(
        function (row) {

            csvRows.push(

                row
                    .map(
                        function (value) {

                            return `"${String(
                                value ?? ""
                            )
                                .replace(
                                    /"/g,
                                    '""'
                                )}"`;

                        }
                    )
                    .join(",")

            );

        }
    );


    const csv =
        csvRows.join(
            "\n"
        );


    const blob =
        new Blob(
            [csv],
            {

                type:
                    "text/csv;charset=utf-8;"

            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "studenthub-report.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Report exported successfully!",
        "success"
    );

}


// ==========================================
// NAVIGATION
// ==========================================

function setupNavigation() {

    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    navLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const section =
                        this.dataset.section;


                    if (section) {

                        showSection(
                            section
                        );

                    }

                }
            );

        }
    );

}


// ==========================================
// SHOW SECTION
// ==========================================

function showSection(
    sectionName
) {

    const sections =
        document.querySelectorAll(
            ".section"
        );


    sections.forEach(
        function (section) {

            section.style.display =
                "none";

        }
    );


    const target =
        document.getElementById(
            sectionName
        );


    if (target) {

        target.style.display =
            "block";

    }


    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    navLinks.forEach(
        function (link) {

            link.classList.remove(
                "active"
            );


            if (
                link.dataset.section ===
                sectionName
            ) {

                link.classList.add(
                    "active"
                );

            }

        }
    );


    if (
        sectionName ===
        "reports"
    ) {

        updateReports();

    }

}


// ==========================================
// ADD STUDENT SETUP
// ==========================================

function setupAddStudent() {

    const form =
        document.getElementById(
            "studentForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            addStudent
        );

    }


    const addButton =
        document.getElementById(
            "addStudentBtn"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            function () {

                showSection(
                    "add-student"
                );

            }
        );

    }

}


// ==========================================
// FILTER SETUP
// ==========================================

function setupFilters() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const courseFilter =
        document.getElementById(
            "courseFilter"
        );


    const gradeFilter =
        document.getElementById(
            "gradeFilter"
        );


    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    const clearButton =
        document.getElementById(
            "clearFiltersBtn"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    if (courseFilter) {

        courseFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (gradeFilter) {

        gradeFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            applyFilters
        );

    }


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearFilters
        );

    }


    const pageSizeSelect =
        document.getElementById(
            "pageSizeSelect"
        );


    if (pageSizeSelect) {

        pageSizeSelect.addEventListener(
            "change",
            function () {

                pageSize =
                    Number(
                        this.value
                    ) || 5;


                currentPage = 1;


                renderStudents();

                renderPagination();

            }
        );

    }

}


// ==========================================
// EDIT MODAL SETUP
// ==========================================

function setupEditModal() {

    const form =
        document.getElementById(
            "editStudentForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            updateStudent
        );

    }


    const closeButton =
        document.getElementById(
            "closeEditModal"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeEditModal
        );

    }


    const modal =
        document.getElementById(
            "editModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    modal
                ) {

                    closeEditModal();

                }

            }
        );

    }

}


// ==========================================
// CLOSE EDIT MODAL
// ==========================================

function closeEditModal() {

    const modal =
        document.getElementById(
            "editModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ==========================================
// PROFILE MODAL SETUP
// ==========================================

function setupProfileModal() {

    const closeButton =
        document.getElementById(
            "closeProfileModal"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeProfileModal
        );

    }


    const modal =
        document.getElementById(
            "profileModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    modal
                ) {

                    closeProfileModal();

                }

            }
        );

    }


    const editButton =
        document.getElementById(
            "profileEditBtn"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            editFromProfile
        );

    }


    const deleteButton =
        document.getElementById(
            "profileDeleteBtn"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            deleteFromProfile
        );

    }

}


// ==========================================
// THEME TOGGLE
// ==========================================

function setupThemeToggle() {

    const themeToggle =
        document.getElementById(
            "themeToggle"
        );


    if (!themeToggle) return;


    const savedTheme =
        localStorage.getItem(
            "studenthub-theme"
        );


    if (
        savedTheme ===
        "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

    }


    themeToggle.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark-mode"
            );


            const isDark =
                document.body.classList.contains(
                    "dark-mode"
                );


            localStorage.setItem(

                "studenthub-theme",

                isDark
                    ? "dark"
                    : "light"

            );

        }
    );

}


// ==========================================
// EXPORT SETUP
// ==========================================

function setupExport() {

    const exportButton =
        document.getElementById(
            "exportReportBtn"
        );


    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportReport
        );

    }

}


// ==========================================
// LOGOUT
// ==========================================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "studenthubLoggedIn"
            );


            sessionStorage.removeItem(
                "studenthubToken"
            );


            sessionStorage.removeItem(
                "studenthubUsername"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// ESC KEY
// ==========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        closeEditModal();

        closeProfileModal();

    }
);