# SLT Backend

This is the backend for the SLT (Sign Language Translator) application. It provides RESTful APIs for authentication, user management, and admin functionalities, using Node.js, Express, and MongoDB.

## Features
- User authentication (JWT)
- Admin and user management
- RESTful API endpoints
- MongoDB integration with Mongoose
- Error handling and middleware support

## Folder Structure
```
SLT-backend/
├── src/
│   ├── app.js                # Express app setup
│   ├── index.js              # Entry point
│   ├── constants.js          # App constants
│   ├── controllers/          # Route controllers (admin, user)
│   ├── db/                   # Database connection
│   ├── middlewares/          # Custom middlewares
│   ├── models/               # Mongoose models
│   ├── routes/               # API route definitions
│   └── utils/                # Utility classes (ApiError, ApiResponse, etc.)
├── public/                   # Public assets
├── package.json              # Project metadata and dependencies
└── Readme.md                 # Project documentation
```

## Setup Instructions
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file based on `.env-sample` and set your environment variables.
3. Start the development server:
   ```bash
   npm run dev
   ```

## Main Dependencies
- express
- mongoose
- jsonwebtoken
- bcryptjs
- multer
- nodemailer
- cloudinary
- dotenv

## Scripts
- `npm run dev` — Start the server with nodemon for development

You can manage everything from here...
