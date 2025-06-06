# Medirate - Hospital and Doctor Rating App

A comprehensive healthcare platform for rating hospitals and doctors, booking appointments, and managing healthcare services. Built with React Native and Node.js.

## Features

- User authentication and role-based access control
- Hospital and doctor ratings and reviews
- Appointment booking system
- Permission management
- MySQL database integration

## Backend Setup

1. Navigate to the project directory:

   ```bash
   cd medirate-be
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with:

   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=medirate_db
   JWT_SECRET=your_jwt_secret
   PORT=5001
   ```

4. Set up MySQL:

   - Install MySQL if not already installed
   - Create a new database named `medirate_db`
   - Ensure MySQL server is running

5. Run the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Permissions

- `GET /api/permissions/roles` - Get all roles and permissions
- `GET /api/permissions/users/:id` - Get user permissions
- `PUT /api/permissions/users/:id` - Update user role (admin only)
- `GET /api/permissions/users` - Get all users with permissions (admin only)

### Appointments

- `GET /api/appointments` - List appointments (filtered by role)
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/:id` - Get appointment details
- `PATCH /api/appointments/:id/status` - Update appointment status
- `GET /api/appointments/available-slots/:doctorId` - Get available time slots

### Hospitals

- `GET /api/hospitals` - List all hospitals
- `POST /api/hospitals` - Create new hospital (admin/hospital_admin only)
- `GET /api/hospitals/:id` - Get hospital details
- `PUT /api/hospitals/:id` - Update hospital (admin/hospital_admin only)

### Doctors

- `GET /api/doctors` - List all doctors
- `POST /api/doctors` - Add new doctor (admin/hospital_admin only)
- `GET /api/doctors/:id` - Get doctor details
- `PUT /api/doctors/:id` - Update doctor (admin/hospital_admin only)

## User Roles

- **Admin**: Full access to all features
- **Hospital Admin**: Manage their hospital, doctors, and appointments
- **User**: Book appointments, view hospitals/doctors, and manage their profile

## Database Structure

- Users (with roles and permissions)
- Hospitals
- Doctors
- Appointments
- Reviews

## Development Notes

- The database is configured to preserve data between server restarts
- Role-based access control is implemented for all routes
- Appointment system includes conflict checking and available slot calculation
- JWT authentication is used for secure API access

## Next Steps

- Implement email notifications for appointments
- Add payment integration
- Implement real-time updates using WebSocket
- Add search and filtering capabilities
- Implement appointment reminders
- Add support for recurring appointments
- Enhance error handling and input validation
- Add API documentation using Swagger/OpenAPI
- Implement rate limiting and security measures
- Add unit and integration tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
