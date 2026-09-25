# 🎓 StudentHub — Student Management System

StudentHub is a full-stack Student Management System that allows an administrator to securely manage student records through a modern and responsive dashboard.

The project demonstrates frontend development, REST API development, authentication, database integration, CRUD operations, and Git/GitHub workflow.

---

## 🚀 Features

### 🔐 Admin Authentication
- Secure admin login
- Password hashing using bcrypt
- JWT-based authentication
- Protected student API routes
- Session-based login management
- Logout functionality

### 👨‍🎓 Student Management
- Add students
- View student records
- Edit student information
- Delete students
- View individual student profiles
- Prevent duplicate Student IDs

### 🔎 Search & Filtering
- Search students by information
- Filter by course
- Filter by grade
- Sort student records
- Pagination

### 📊 Dashboard & Reports
- Total students
- Active students
- Total courses
- Average grade
- Course statistics
- Grade statistics
- Interactive charts
- Report generation

### 🎨 User Interface
- Modern dashboard
- Responsive design
- Sidebar navigation
- Dark mode
- Modal windows
- Toast notifications
- Mobile-friendly interface

---

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript
- Chart.js

### Backend
- Node.js
- Express.js
- REST API
- JWT
- bcrypt.js

### Database
- MongoDB
- MongoDB Atlas
- Mongoose

### Tools
- Visual Studio Code
- Git
- GitHub
- Live Server

---

## 📁 Project Structure

```text
StudentHub/
│
├── FRONT END/
│   ├── index.html
│   ├── login.html
│   ├── script.js
│   └── style.css
│
├── backend/
│   ├── Models/
│   │   ├── Admin.js
│   │   └── Student.js
│   │
│   ├── createAdmin.js
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
Deployment :
The project is being prepared for deployment with:

GitHub
   │
   ├── Frontend
   │
   └── Backend
          │
          ▼
     MongoDB Atlas

Database

StudentHub uses MongoDB Atlas to store:

Student information
Admin authentication data
Student creation/update timestamps

Future Improvements
Cloud deployment
Multiple admin roles
Role-based access control
Password reset
Email notifications
Student attendance management
Student performance analytics
Export data to PDF/Excel
Advanced admin profile management

Author
Divyansh Choudhary

B.Tech — Computer Science & Engineering

If you find the project useful, consider giving the repository a ⭐.
