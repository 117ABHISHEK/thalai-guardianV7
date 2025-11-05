# ThalAI Guardian - MERN Stack Application

A comprehensive Thalassemia management and blood donation platform built with the MERN stack.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
-- **Multi-Role System**: Support for patients, donors, doctors, hospitals, and bloodbanks
- **Role-Based Dashboards**: Customized interfaces for each user type
- **Secure Backend**: Protected routes with middleware authentication
- **Modern UI**: Clean and responsive design with TailwindCSS

## Tech Stack

- **Frontend**: React 18, React Router v6, Context API, Axios, TailwindCSS
- **Backend**: Node.js, Express.js, JWT, bcryptjs, helmet, cors
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens stored in HttpOnly cookies

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thalai-guardian
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   - Copy `server/.env.example` to `server/.env`
   - Update the environment variables:
     ```
     NODE_ENV=development
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/thalai-guardian
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     ```

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/thalai-guardian`

5. **Run the application**
   ```bash
   npm run dev
   ```
   
   This will start both the server (port 5000) and client (port 3000) concurrently.

## Project Structure

```
thalai-guardian/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context (Auth)
│   │   ├── pages/          # Page components
│   │   └── App.js
│   └── package.json
├── server/                 # Express backend
│   ├── middleware/         # Auth & role middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── server.js          # Entry point
│   └── package.json
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Protected Routes
- `GET /api/patient/dashboard` - Patient dashboard data
- `GET /api/donor/dashboard` - Donor dashboard data
- `GET /api/doctor/dashboard` - Doctor dashboard data
-- `GET /api/admin/dashboard` - Admin dashboard data (removed)

## User Roles

1. **Patient**: Track health, view donor requests
2. **Donor**: View donation history, see blood requests
3. **Doctor**: Access patient records, manage appointments
4. **Hospital / Platform**: Hospital owners manage hospital data; platform-level verification is handled by hospital owners or designated verifiers.

## Security Features

- Password hashing with bcryptjs
- JWT tokens stored in HttpOnly cookies
- CORS protection
- Helmet for security headers
- Role-based route protection
- Input validation and sanitization

## Development

### Running Individual Services

**Server only:**
```bash
npm run server
```

**Client only:**
```bash
npm run client
```

### Environment Variables

Create a `.env` file in the `server` directory with:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/thalai-guardian
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
