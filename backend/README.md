# TrackTrack Backend API

A scalable and modular backend for QR-based box tracking system built with Express.js and MongoDB.

## Features

- 🔐 JWT-based authentication with role-based access control
- 📦 Box management with lifecycle tracking
- 🚚 Delivery logging with image upload support
- 👥 User management for Admin, Manufacturer, and End User roles
- 📊 Analytics and reporting endpoints
- 🛡️ Security middleware with rate limiting and validation
- 📁 File upload with local and cloud storage options

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer with Cloudinary integration
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors, rate limiting

## Quick Start

1. **Clone and install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

4. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Box Management
- `POST /api/boxes` - Create new box
- `GET /api/boxes/:id` - Get box by ID
- `PATCH /api/boxes/:id/status` - Update box status
- `GET /api/boxes` - List boxes with filters

### Delivery Management
- `POST /api/deliveries` - Submit delivery
- `GET /api/deliveries` - List deliveries
- `GET /api/deliveries/:boxId` - Get box delivery history

### User Management (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Analytics
- `GET /api/stats` - Get system statistics

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # Express routes
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/      # Input validation schemas
└── server.js        # Application entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT License
