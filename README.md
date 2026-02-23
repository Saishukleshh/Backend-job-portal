# 🚀 Job Portal Backend API

A production-ready **Node.js + Express** backend for a dual-interface job portal where **candidates** search for openings & manage resumes, and **recruiters** publish listings & track applications.

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Database Models](#-database-models)
- [Authentication](#-authentication)
- [File Uploads](#-file-uploads)
- [Error Monitoring](#-error-monitoring)

---

## 🏗 Architecture

```
backend-job-portal/
├── config/
│   ├── db.js                # MongoDB connection
│   ├── cloudinary.js        # Cloudinary configuration
│   └── sentry.js            # Sentry error monitoring setup
├── controllers/
│   ├── companyController.js # Recruiter register/login/profile
│   ├── jobController.js     # Job CRUD + filtering
│   ├── applicationController.js # Apply, view, update status
│   ├── userController.js    # User profile & resume upload
│   └── webhookController.js # Clerk webhook handler
├── middlewares/
│   ├── authUser.js          # Clerk authentication middleware
│   ├── authCompany.js       # JWT authentication middleware
│   └── multer.js            # File upload middleware
├── models/
│   ├── User.js              # Job seeker schema (Clerk ID)
│   ├── Company.js           # Recruiter schema (JWT auth)
│   ├── Job.js               # Job listing schema
│   └── JobApplication.js   # Application bridge schema
├── routes/
│   ├── companyRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   ├── userRoutes.js
│   └── webhookRoutes.js
├── utils/
│   ├── cloudinaryUpload.js  # Upload/delete helpers
│   └── generateToken.js     # JWT generator
├── server.js                # App entry point
├── .env.example             # Environment template
└── package.json
```

---

## 🛠 Tech Stack

| Technology       | Purpose                          |
| ---------------- | -------------------------------- |
| **Node.js**      | Runtime environment              |
| **Express.js**   | Web framework                    |
| **MongoDB**      | NoSQL database                   |
| **Mongoose**     | ODM with schema validation       |
| **Clerk**        | User (candidate) authentication  |
| **JWT + bcrypt** | Recruiter custom authentication  |
| **Cloudinary**   | Image & PDF cloud storage        |
| **Multer**       | File upload parsing              |
| **Sentry**       | Real-time error monitoring       |
| **Svix**         | Clerk webhook verification       |
| **Helmet**       | HTTP security headers            |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (Atlas cloud or local)
- **Clerk** account (for user auth)
- **Cloudinary** account (for file storage)
- **Sentry** account (optional, for monitoring)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd backend-job-portal

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Fill in your environment variables in .env

# Start development server
npm run dev

# Start production server
npm start
```

---

## 🔐 Environment Variables

| Variable                 | Description                      |
| ------------------------ | -------------------------------- |
| `PORT`                   | Server port (default: 5000)      |
| `NODE_ENV`               | `development` or `production`    |
| `MONGODB_URI`            | MongoDB connection string        |
| `CLERK_PUBLISHABLE_KEY`  | Clerk publishable key            |
| `CLERK_SECRET_KEY`       | Clerk secret key                 |
| `CLERK_WEBHOOK_SECRET`   | Clerk webhook signing secret     |
| `JWT_SECRET`             | Secret for recruiter JWT tokens  |
| `CLOUDINARY_CLOUD_NAME`  | Cloudinary cloud name            |
| `CLOUDINARY_API_KEY`     | Cloudinary API key               |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret            |
| `SENTRY_DSN`             | Sentry DSN (optional)            |
| `FRONTEND_URL`           | Allowed CORS origin              |

---

## 📡 API Endpoints

### Company / Recruiter

| Method | Endpoint                | Auth     | Description             |
| ------ | ----------------------- | -------- | ----------------------- |
| POST   | `/api/company/register` | Public   | Register new company    |
| POST   | `/api/company/login`    | Public   | Login & get JWT token   |
| GET    | `/api/company/profile`  | Company  | Get company profile     |
| PUT    | `/api/company/profile`  | Company  | Update profile / logo   |

### Jobs

| Method | Endpoint                      | Auth     | Description             |
| ------ | ----------------------------- | -------- | ----------------------- |
| GET    | `/api/jobs`                   | Public   | List jobs with filters  |
| GET    | `/api/jobs/:id`               | Public   | Get job details         |
| POST   | `/api/jobs`                   | Company  | Create new job          |
| GET    | `/api/jobs/company/list`      | Company  | Get company's own jobs  |
| PUT    | `/api/jobs/:id`               | Company  | Update job listing      |
| DELETE | `/api/jobs/:id`               | Company  | Delete job listing      |
| PATCH  | `/api/jobs/:id/visibility`    | Company  | Toggle job visibility   |

**Filtering Query Params:** `?category=Programming&level=Senior&location=Remote&search=react&page=1&limit=10`

### Applications

| Method | Endpoint                          | Auth     | Description               |
| ------ | --------------------------------- | -------- | ------------------------- |
| POST   | `/api/applications/:jobId`        | User     | Apply for a job           |
| GET    | `/api/applications/user`          | User     | Get user's applications   |
| GET    | `/api/applications/company`       | Company  | Get all company apps      |
| GET    | `/api/applications/job/:jobId`    | Company  | Get apps for a specific job |
| PATCH  | `/api/applications/:id/status`    | Company  | Update app status         |

### Users

| Method | Endpoint              | Auth  | Description          |
| ------ | --------------------- | ----- | -------------------- |
| GET    | `/api/users/profile`  | User  | Get user profile     |
| PUT    | `/api/users/profile`  | User  | Update user profile  |
| POST   | `/api/users/resume`   | User  | Upload resume (PDF)  |

### Webhooks

| Method | Endpoint               | Auth     | Description            |
| ------ | ---------------------- | -------- | ---------------------- |
| POST   | `/api/webhooks/clerk`  | Svix     | Clerk webhook handler  |

---

## 📦 Database Models

### User
```
_id         → String (Clerk user ID)
name        → String
email       → String (unique)
image       → String (URL)
resume      → String (Cloudinary URL)
timestamps  → createdAt, updatedAt
```

### Company
```
_id         → ObjectId (auto)
name        → String
email       → String (unique)
password    → String (bcrypt hashed, select: false)
image       → String (Cloudinary URL)
timestamps  → createdAt, updatedAt
```

### Job
```
_id         → ObjectId (auto)
title       → String
description → String
location    → String
category    → Enum (Programming, Design, Marketing, ...)
level       → Enum (Beginner, Intermediate, Senior, Lead, Director)
salary      → Number
companyId   → ObjectId → Company
date        → Date
visible     → Boolean
timestamps  → createdAt, updatedAt
```

### JobApplication
```
_id         → ObjectId (auto)
userId      → String → User (Clerk ID)
companyId   → ObjectId → Company
jobId       → ObjectId → Job
status      → Enum (pending, accepted, rejected)
date        → Date
timestamps  → createdAt, updatedAt
Unique index: (userId + jobId) — prevents duplicate applications
```

---

## 🔒 Authentication

### For Candidates (Clerk)
- Clerk handles sign-in/sign-up with Google, email, etc.
- The `clerkMiddleware()` parses session tokens on every request
- Protected user routes use `authUser` middleware which extracts `userId`
- Clerk webhooks sync user data to MongoDB automatically

### For Recruiters (Custom JWT)
- Companies register with email & password (bcrypt hashed)
- Login returns a JWT valid for **30 days**
- Protected company routes use `authCompany` middleware
- Token sent via `Authorization: Bearer <token>` header

---

## 📁 File Uploads

- **Multer** parses multipart form data (memory storage)
- **Cloudinary** stores files in the cloud
- Company logos: images up to 5MB (jpeg, jpg, png, webp, gif)
- User resumes: PDFs up to 10MB
- Old files are deleted from Cloudinary when replaced

---

## 📊 Error Monitoring

- **Sentry** tracks runtime errors, API crashes, and MongoDB query performance
- Configured to sample 100% in development, 20% in production
- Error handler is attached after all routes
- Set `SENTRY_DSN` in `.env` to enable (optional)

---

## 📝 License

ISC
