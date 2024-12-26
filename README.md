# Car Rental Server

## Features

- **JWT Authentication**: Secure JWT-based authentication for user login.
- **MongoDB Integration**: MongoDB is used to manage car listings and booking data.
- **Protected Routes**: Access to car management and booking routes is protected by JWT authentication.
- **Car Management**: Allows adding, updating, deleting, and fetching cars.
- **Booking Management**: Manage car bookings, including creating, updating, deleting bookings.
- **Booking Status Updates**: Update booking status (e.g., confirmed, canceled) and update car availability accordingly.
- **User-Specific Data**: Allows users to fetch their own car listings and bookings.

## API Endpoints

### Authentication Endpoints

- **POST /jwt**

  - Description: Generate a JWT token for the user.
  - Request Body:
    ```json
    {
      "email": "user@example.com",
      "password": "userpassword"
    }
    ```
  - Response:
    ```json
    {
      "message": "jwt issued and cookie set"
    }
    ```

- **POST /logout**
  - Description: Log out the user by clearing the JWT token.
  - Response:
    ```json
    {
      "success": true,
      "message": "Logged out successfully"
    }
    ```

---

### Car Management Endpoints

- **POST /add-car**

  - Description: Add a new car to the database.
  - Request Body:
    ```json
    {
      "name": "Car Name",
      "model": "Car Model",
      "pricePerDay": 100,
      "owner": {
        "email": "owner@example.com",
        "name": "Owner Name"
      },
      "avalilable": true
    }
    ```

- **GET /cars**

  - Description: Get a list of all cars available.
  - Response:
    ```json
    [
      {
        "_id": "car_id",
        "name": "Car Name",
        "model": "Car Model",
        "pricePerDay": 100,
        "owner": {
          "email": "owner@example.com",
          "name": "Owner Name"
        },
        "avalilable": true
      }
    ]
    ```

- **GET /cars/:id**

  - Description: Get a single car by ID.
  - Response:
    ```json
    {
      "_id": "car_id",
      "name": "Car Name",
      "model": "Car Model",
      "pricePerDay": 100,
      "owner": {
        "email": "owner@example.com",
        "name": "Owner Name"
      },
      "avalilable": true
    }
    ```

- **DELETE /cars/:id**

  - Description: Delete a car by ID.
  - Response:
    ```json
    {
      "message": "Car deleted"
    }
    ```

- **PATCH /cars/:id**
  - Description: Update a car by ID.
  - Request Body:
    ```json
    {
      "name": "Updated Car Name",
      "pricePerDay": 150
    }
    ```

---

### Booking Management Endpoints

- **POST /bookings**

  - Description: Book a car.
  - Request Body:
    ```json
    {
      "carId": "car_id",
      "hirer": {
        "email": "hirer@example.com",
        "name": "Hirer Name"
      },
      "bookingDate": "2024-12-01",
      "endDate": "2024-12-07",
      "status": "Pending"
    }
    ```

- **GET /my-bookings/:email**

  - Description: Get all bookings for a specific user by email.
  - Response:
    ```json
    [
      {
        "_id": "booking_id",
        "carId": "car_id",
        "hirer": {
          "email": "hirer@example.com",
          "name": "Hirer Name"
        },
        "bookingDate": "2024-12-01",
        "endDate": "2024-12-07",
        "status": "Pending"
      }
    ]
    ```

- **DELETE /bookings/:id**

  - Description: Delete a booking by ID.
  - Response:
    ```json
    {
      "message": "Booking deleted"
    }
    ```

- **PUT /bookings/:id**

  - Description: Update booking dates.
  - Request Body:
    ```json
    {
      "bookingDate": "2024-12-02",
      "endDate": "2024-12-08"
    }
    ```

- **PATCH /booking/:id**
  - Description: Update the status of a booking.
  - Query Parameters:
    - `status`: The status of the booking (e.g., "Confirmed", "Pending", "Canceled").
    - `carId`: The ID of the car being booked.
  - Response:
    ```json
    {
      "carUpdateResult": {...},
      "bookingUpdateResult": {...}
    }
    ```

---

### Miscellaneous Endpoints

- **GET /latest**

  - Description: Get the latest 6 cars added.
  - Response:
    ```json
    [
      {
        "_id": "car_id",
        "name": "Car Name",
        "model": "Car Model",
        "pricePerDay": 100,
        "owner": {
          "email": "owner@example.com",
          "name": "Owner Name"
        },
        "avalilable": true
      }
    ]
    ```

- **GET /booking/request**

  - Description: Get all bookings for a specific car owner by email.
  - Query Parameters:
    - `email`: The email of the car owner.
  - Response:
    ```json
    [
      {
        "carId": "car_id",
        "hirer": {
          "email": "hirer@example.com",
          "name": "Hirer Name"
        },
        "bookingDate": "2024-12-01",
        "endDate": "2024-12-07",
        "status": "Pending"
      }
    ]
    ```

- **GET /booking/request/status**
  - Description: Get bookings by status for a specific car owner.
  - Query Parameters:
    - `email`: The email of the car owner.
    - `status`: The booking status (e.g., "Confirmed", "Pending", "Canceled").
  - Response:
    ```json
    [
      {
        "_id": "booking_id",
        "carId": "car_id",
        "hirer": {
          "email": "hirer@example.com",
          "name": "Hirer Name"
        },
        "bookingDate": "2024-12-01",
        "endDate": "2024-12-07",
        "status": "Pending"
      }
    ]
    ```

---

## Error Handling

- **400 Bad Request**: When the client sends an invalid request.
- **401 Unauthorized**: When the user is not authenticated.
- **403 Forbidden**: When the user does not have permission to access the resource.
- **404 Not Found**: When the requested resource does not exist.
- **500 Internal Server Error**: When there is a server-side issue.

---

## Environment Variables

- `DB_USER`: The MongoDB database username.
- `DB_PASS`: The MongoDB database password.
- `SECRECT_KEY`: The secret key used to sign JWT tokens.
- `PORT`: The port for the server to run on.
- `NODE_ENV`: The environment mode (development/production).
