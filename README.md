
# Car Rental Server

A backend server for managing car rentals, bookings, and user authentication using **Node.js**, **Express.js**, **MongoDB**, and **JWT Authentication**.

## Features

- **JWT Authentication**: Secure JWT-based authentication for user login.
- **MongoDB Integration**: MongoDB is used to manage car listings and booking data.
- **Protected Routes**: Access to car management and booking routes is protected by JWT authentication.
- **Car Management**: Allows adding, updating, deleting, and fetching cars.
- **Booking Management**: Manage car bookings, including creating, updating, deleting bookings.
- **Booking Status Updates**: Update booking status (e.g., confirmed, canceled) and update car availability accordingly.
- **User-Specific Data**: Allows users to fetch their own car listings and bookings.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (local or cloud-based)

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/your-username/car-rental-server.git
   cd car-rental-server
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file in the root directory and add:
   ```sh
   DB_USER=your_db_username
   DB_PASS=your_db_password
   SECRECT_KEY=your_jwt_secret
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```sh
   npm start
   ```
   The server should now be running at `http://localhost:5000`.

### API Endpoints

#### Authentication

- **POST /jwt** - Generate a JWT token for authentication.
- **POST /logout** - Log out the user.

#### Car Management

- **POST /add-car** - Add a new car.
- **GET /cars** - Retrieve all available cars.
- **GET /cars/:id** - Retrieve a single car by ID.
- **PATCH /cars/:id** - Update car details.
- **DELETE /cars/:id** - Remove a car.

#### Booking Management

- **POST /bookings** - Create a new booking.
- **GET /my-bookings/:email** - Get bookings by user email.
- **PUT /bookings/:id** - Update booking details.
- **PATCH /booking/:id** - Update booking status.
- **DELETE /bookings/:id** - Remove a booking.

#### Miscellaneous

- **GET /latest** - Retrieve the latest 6 cars added.
- **GET /booking/request** - Get bookings for a car owner.
- **GET /booking/request/status** - Get bookings filtered by status.

## Error Handling

- **400 Bad Request**: Invalid request.
- **401 Unauthorized**: Authentication required.
- **403 Forbidden**: Access denied.
- **404 Not Found**: Resource not found.
- **500 Internal Server Error**: Server failure.

