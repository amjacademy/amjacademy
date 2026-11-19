# AMJ Academy - Music Learning Management System

<div align="center">
  <img src="public/images/amj-logo.png" alt="AMJ Academy Logo" width="200"/>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
  [![Supabase](https://img.shields.io/badge/Database-Supabase-brightgreen.svg)](https://supabase.com/)
</div>

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🎵 About

AMJ Academy is a comprehensive Music Learning Management System designed to streamline music education. It provides a complete platform for managing music classes, including piano, vocal, and Hindi music lessons. The system features separate portals for students, teachers, and administrators, enabling efficient class scheduling, real-time communication, assignment management, and progress tracking.

### Key Highlights

- **Multi-role Authentication**: Separate dashboards for students, teachers, and administrators
- **Real-time Class Management**: Live class tracking with join/leave functionality
- **Smart Scheduling**: Individual and group class arrangements with automated slot management
- **Communication Hub**: Built-in messaging system and announcements
- **Progress Tracking**: Class reports, punctuality tracking, and assessment management
- **Demo Booking System**: OTP-based verification via WhatsApp and Email

## ✨ Features

### For Students
- 📚 **Dashboard**: View upcoming classes, ongoing sessions, and announcements
- 📅 **Class Scheduling**: Book individual or group classes
- 💬 **Messaging**: Direct communication with teachers
- 📊 **Reports**: Access class reports and punctuality records
- 📝 **Assignments**: View and submit assessments
- 🔔 **Notifications**: Real-time updates on class changes and announcements
- 🚪 **Leave Management**: Request leave or last-minute cancellations

### For Teachers
- 👨‍🏫 **Teaching Dashboard**: Manage scheduled classes and student progress
- 📋 **Attendance**: Track student attendance and punctuality
- 📝 **Assessment Creation**: Create and assign assessments to students
- 💬 **Student Communication**: Message students individually or in groups
- 📊 **Performance Analytics**: View student progress and class reports
- 📢 **Announcements**: Send targeted announcements to students

### For Administrators
- 👥 **User Management**: Manage student and teacher enrollments
- 📊 **Analytics Dashboard**: View system-wide statistics and metrics
- 📅 **Class Scheduling**: Create and manage class arrangements
- 🔔 **Notification System**: Send system-wide announcements
- 📈 **Reports**: Generate comprehensive reports on all activities
- ⚙️ **System Configuration**: Manage slots, courses, and system settings

### General Features
- 🔐 **Secure Authentication**: JWT-based authentication with HTTP-only cookies
- 📱 **Responsive Design**: Mobile-friendly interface
- ⚡ **Real-time Updates**: Live class status updates using Supabase real-time subscriptions
- 🎨 **Modern UI/UX**: Clean and intuitive interface with smooth animations
- 📧 **Email Notifications**: Automated email notifications via Nodemailer
- ☁️ **Cloud Storage**: File uploads via Cloudinary
- 🔄 **Session Management**: Persistent login sessions

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19.1.1 with Vite
- **Routing**: React Router DOM 7.8.0
- **Styling**: CSS3 with Tailwind CSS
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Icons**: React Icons
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.1.0
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Express Session
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **SMS/WhatsApp**: Twilio
- **Real-time**: Supabase Real-time subscriptions

### Additional Services
- **Cloud Storage**: Cloudinary
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Firebase Admin SDK
- **Deployment**: Render (Backend) + Netlify/Vercel (Frontend)

## 📁 Project Structure

```
amjacademy/
├── public/                      # Static assets
│   ├── images/                 # Images and logos
│   ├── assets/                 # Other static files
│   ├── _redirects              # Netlify redirects
│   └── sendmail.php            # Legacy email handler
│
├── src/                        # Frontend source
│   ├── components/             # React components
│   │   ├── Admin/             # Admin dashboard components
│   │   ├── Student_setup/     # Student dashboard components
│   │   ├── Teacher_setup/     # Teacher dashboard components
│   │   ├── common/            # Shared components
│   │   ├── Footer/            # Footer component
│   │   ├── Header/            # Header component
│   │   └── Login/             # Login components
│   ├── assets/                # Frontend assets
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # App entry point
│   ├── supabaseClient.js      # Supabase client config
│   └── *.css                  # Component styles
│
├── server/                     # Backend source
│   ├── config/                # Configuration files
│   │   ├── cloudinaryConfig.js
│   │   ├── firebase.js
│   │   ├── nodemailer.js
│   │   ├── supabaseClient.js
│   │   └── supabaseAdminClient.js
│   ├── controllers/           # Route controllers
│   │   ├── teacher/          # Teacher-specific controllers
│   │   └── *.js              # Various controllers
│   ├── models/                # Data models
│   ├── routes/                # API routes
│   │   ├── teacher/          # Teacher routes
│   │   └── *.js              # Various routes
│   ├── utils/                 # Utility functions
│   │   ├── asyncHandler.js
│   │   ├── authController.js
│   │   ├── errorHandler.js
│   │   ├── generateOTP.js
│   │   └── sendWhatsApp.js
│   ├── files/                 # Email templates
│   └── server.js              # Server entry point
│
├── scripts/                    # Utility scripts
├── .env                       # Environment variables
├── package.json               # Frontend dependencies
├── vite.config.js             # Vite configuration
└── eslint.config.js           # ESLint configuration
```

## ⚙️ Environment Variables

Set `VITE_MAIN` in the frontend `.env` to the backend API URL. In `server/.env` and in the deployed backend environment, configure `RESEND_API_KEY` and `ADMIN_EMAIL` for login OTP and contact-form email delivery. Verify `AMJacademy@amjacademy.in` with Resend for login/contact mail and `no-reply@amjacademy.in` for demo-booking OTP mail. Keep service keys out of frontend variables and source control.

## 💻 Usage

### Default Admin Login
```
Email: admin@amjacademy.com
Password: admin123 (change after first login)
```

### Student Registration
1. Visit the homepage
2. Click "Register" or "Book Demo Class"
3. Complete the OTP verification (Email/WhatsApp)
4. Fill in the enrollment form
5. Access your student dashboard

### Teacher Onboarding
- Teachers are added by administrators
- Teachers receive login credentials via email
- Access teacher dashboard with provided credentials

### Key Workflows

**Booking a Class (Student):**
1. Login to student dashboard
2. Navigate to "Book Class" section
3. Select preferred time slot
4. Choose individual or group class
5. Confirm booking

**Creating an Assignment (Teacher):**
1. Login to teacher dashboard
2. Navigate to "Assessments"
3. Create new assessment
4. Assign to specific students or groups
5. Set deadline and publish

**Managing Enrollments (Admin):**
1. Login to admin dashboard
2. Navigate to "Enrollments"
3. Approve/reject pending enrollments
4. Manage student and teacher accounts
5. View system analytics


## 🤝 Contributors

Thanks to the following contributors for their valuable work on this project:

- [@Gideon1828](https://github.com/Gideon1828)
- [@S K Ajay Kumar](https://github.com/Ajaykumar8j3heiwjv)

Contributions are welcome! Please follow the contribution guidelines.


### Coding Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting PR
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Development Team** - *Initial work* - [AMJ Academy](https://amjacademy.in)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Supabase for the excellent backend-as-a-service platform
- Cloudinary for media management
- React and Vite communities for excellent tooling

## 📞 Contact

- **Website**: [https://amjacademy.in](https://amjacademy.in)
- **Email**: info@amjacademy.in
- **Support**: support@amjacademy.in

## 🐛 Known Issues

- WhatsApp OTP requires Twilio trial account verification
- Group class reschedule notifications need optimization
- Mobile responsive layout improvements in progress


---

<div align="center">
  Made with ❤️ by AMJ Academy Team
  
  ⭐ Star us on GitHub — it helps!
</div>
