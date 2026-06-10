# MediBook — Book a Doctor App
### Full-Stack MERN Healthcare Booking Platform

---

## Project Structure

```
BookADoctor/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state (JWT)
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Register.jsx        # Sign up
│   │   │   ├── Login.jsx           # Sign in
│   │   │   ├── Doctors.jsx         # Browse + filter doctors
│   │   │   ├── BookAppointment.jsx # 3-step booking flow
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ApplyDoctor.jsx
│   │   ├── utils/
│   │   │   └── api.js         # Axios instance with JWT interceptor
│   │   ├── App.jsx            # Router with role-based routes
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js         # Vite + API proxy config
│   └── package.json
│
└── server/                    # Node.js + Express backend (MVC)
    ├── models/
    │   ├── User.js            # Patient / Doctor / Admin
    │   ├── Doctor.js          # Doctor profile & availability
    │   ├── Appointment.js     # Booking with documents
    │   └── Notification.js    # In-app notifications
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── doctorController.js
    │   ├── appointmentController.js
    │   └── adminController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── doctorRoutes.js
    │   ├── appointmentRoutes.js
    │   └── adminRoutes.js
    ├── middleware/
    │   ├── auth.js            # JWT protect + role authorize
    │   └── upload.js          # Multer file upload
    ├── uploads/               # Uploaded documents (auto-created)
    ├── server.js              # Express app entry point
    └── package.json
```

---

## Setup Instructions

### Prerequisites
- Node.js v16+
- npm
- MongoDB (local) or MongoDB Atlas account

### 1. Clone / open the project in VS Code

### 2. Setup Server

```bash
cd server
cp .env.example .env
# Edit .env — set your MONGO_URI and JWT_SECRET
npm install
npm run dev       # starts on http://localhost:5000
```

### 3. Setup Client

```bash
cd client
npm install
npm run dev       # starts on http://localhost:5173
```

> The Vite dev server proxies `/api/*` → `http://localhost:5000` automatically.

---

## Environment Variables (server/.env)

| Variable    | Description                        | Example                                        |
|-------------|------------------------------------|-------------------------------------------------|
| PORT        | Server port                        | 5000                                            |
| MONGO_URI   | MongoDB connection string          | mongodb://localhost:27017/bookaDoctor           |
| JWT_SECRET  | Secret key for JWT signing         | my_super_secret_key_here                        |
| JWT_EXPIRE  | Token expiry                       | 7d                                              |

---

## API Endpoints

### Auth
| Method | Route                | Access  | Description          |
|--------|----------------------|---------|----------------------|
| POST   | /api/auth/register   | Public  | Register new user    |
| POST   | /api/auth/login      | Public  | Login, get JWT       |
| GET    | /api/auth/me         | Private | Current user info    |

### Doctors
| Method | Route                     | Access            | Description              |
|--------|---------------------------|-------------------|--------------------------|
| GET    | /api/doctors              | Public            | List approved doctors    |
| GET    | /api/doctors/:id          | Public            | Doctor detail            |
| POST   | /api/doctors/apply        | Patient           | Apply to become doctor   |
| GET    | /api/doctors/my-profile   | Doctor            | Own doctor profile       |
| PUT    | /api/doctors/profile      | Doctor            | Update profile           |

### Appointments
| Method | Route                                | Access   | Description                  |
|--------|--------------------------------------|----------|------------------------------|
| POST   | /api/appointments                    | Patient  | Book appointment + upload    |
| GET    | /api/appointments/my                 | Patient  | Own appointments             |
| PUT    | /api/appointments/:id/cancel         | Patient  | Cancel appointment           |
| GET    | /api/appointments/doctor-appointments| Doctor   | Appointments for this doctor |
| PUT    | /api/appointments/:id/status         | Doctor   | Confirm/complete/reject      |
| GET    | /api/appointments/:id                | Both     | Appointment detail           |

### Admin
| Method | Route                         | Access | Description               |
|--------|-------------------------------|--------|---------------------------|
| GET    | /api/admin/dashboard          | Admin  | Platform stats            |
| GET    | /api/admin/doctors/pending    | Admin  | Pending doctor apps       |
| PUT    | /api/admin/doctors/:id/approve| Admin  | Approve doctor            |
| PUT    | /api/admin/doctors/:id/reject | Admin  | Reject doctor             |
| GET    | /api/admin/users              | Admin  | All users                 |
| PUT    | /api/admin/users/:id/toggle   | Admin  | Activate/deactivate user  |
| GET    | /api/admin/appointments       | Admin  | All appointments          |

---

## User Roles & Flows

### Patient
1. Register → Login → Browse Doctors → Book Appointment (3-step)
2. Upload documents (PDF/JPG/PNG up to 10MB each)
3. Track appointments (pending → confirmed → completed)
4. Apply as Doctor (application goes to admin for review)

### Doctor
1. After approval by admin, role changes from `patient` → `doctor`
2. Access Doctor Dashboard
3. Confirm / Reject pending appointments
4. Add visit notes, mark completed

### Admin
1. Register with role `admin`
2. Review and approve/reject doctor applications
3. View all users, toggle active status
4. Monitor all platform appointments

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, React Router v6         |
| Styling    | Bootstrap 5, React Toastify             |
| HTTP Client| Axios (with JWT interceptor)            |
| Backend    | Node.js, Express.js                     |
| Database   | MongoDB, Mongoose (MVC pattern)         |
| Auth       | JWT, bcryptjs (password hashing)        |
| File Upload| Multer (PDF/JPG/PNG, 10MB limit)        |
| Validation | express-validator                       |

---

## Security Features
- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens with configurable expiry
- Role-based access control on every protected route
- File type & size validation on uploads
- Auto-logout on 401 (expired/invalid token)
- Input validation via express-validator