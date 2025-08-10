# TrackTrack API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Test Accounts
- **Admin**: admin@tracktrack.com / Admin123!
- **Manufacturer**: manufacturer@tracktrack.com / Manufacturer123!
- **Agent**: agent@tracktrack.com / Agent123!

## Endpoints

### Authentication

#### POST /auth/login
Login and get JWT token
```json
{
  "email": "admin@tracktrack.com",
  "password": "Admin123!"
}
```

#### POST /auth/register
Register new user (Admin can create accounts)
```json
{
  "name": "New User",
  "email": "user@example.com",
  "password": "Password123!",
  "role": "end-user"
}
```

#### GET /auth/me
Get current user profile (requires auth)

### Box Management

#### POST /boxes
Create new box (Manufacturer/Admin only)
```json
{
  "boxId": "BOX006",
  "manufacturer": "EcoBox Ltd.",
  "maxUsage": 20,
  "currentLocation": "Warehouse A",
  "material": "Recycled Cardboard"
}
```

#### GET /boxes/:id
Get box by ID or boxId (e.g., /boxes/BOX001)

#### GET /boxes
List boxes with filters
- Query params: status, manufacturer, location, page, limit, search

#### PATCH /boxes/:id/status
Update box status (Manufacturer/Admin only)
```json
{
  "status": "damaged",
  "reason": "Box damaged during transport",
  "incrementUsage": false
}
```

### Delivery Management

#### POST /deliveries
Create delivery (with optional photo upload)
```json
{
  "boxId": "BOX001",
  "deliveryLocation": {
    "address": "123 Main St, City, State 12345",
    "city": "City",
    "state": "State",
    "zipCode": "12345"
  },
  "recipient": {
    "name": "John Doe",
    "phone": "+1-555-0123",
    "email": "john@example.com"
  },
  "notes": "Left at front door"
}
```

#### GET /deliveries
List deliveries with filters
- Query params: boxId, deliveredBy, status, startDate, endDate, city, state

#### GET /deliveries/:id
Get delivery by ID

#### GET /deliveries/box/:boxId
Get delivery history for specific box

### User Management (Admin Only)

#### GET /users
List all users with filters
- Query params: role, isActive, page, limit, search

#### POST /users
Create new user
```json
{
  "name": "New User",
  "email": "user@example.com",
  "password": "Password123!",
  "role": "end-user"
}
```

#### PUT /users/:id
Update user details

#### DELETE /users/:id
Delete user

### Analytics & Statistics

#### GET /stats
Get system overview statistics

#### GET /stats/deliveries
Get delivery analytics
- Query params: period (7d, 30d, 90d, 1y), groupBy (hour, day, week, month)

#### GET /stats/boxes
Get box usage analytics

#### GET /stats/activity
Get user activity analytics

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## File Upload
For delivery photos, use multipart/form-data with field name `deliveryPhoto`.
Maximum file size: 5MB
Supported formats: Images only (jpg, png, gif, etc.)

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Applies to all /api/* endpoints

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tracktrack.com","password":"Admin123!"}'
```

### Get Boxes (with auth token)
```bash
curl -X GET http://localhost:5000/api/boxes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Delivery with Photo
```bash
curl -X POST http://localhost:5000/api/deliveries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F 'boxId=BOX001' \
  -F 'deliveryLocation[address]=123 Test St, City, State 12345' \
  -F 'recipient[name]=Test User' \
  -F 'deliveryPhoto=@/path/to/photo.jpg'
```
