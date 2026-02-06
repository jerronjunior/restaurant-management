# Restaurant Reservation and Food Ordering Web Application

A full-stack web application for restaurant table reservations and food ordering system built with React.js, Node.js, Express.js, and MongoDB.

## Features

### User Features
- User Registration and Login (JWT authentication)
- Browse restaurant menu with food name, price, image, and description
- Select reservation date and time
- Select multiple food items and quantities
- Add items to cart
- Checkout and simulated payment system
- View booking history and order status
- Cancel reservation before confirmation

### Admin Features
- Admin login
- Add/Edit/Delete menu items
- View all reservations
- View all food orders
- See total price and daily revenue
- Update order status (Pending, Preparing, Ready, Completed)

## Tech Stack

- **Frontend**: React.js, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
restaurant-reservation-app/
├── backend/
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth and validation middleware
│   ├── server.js         # Express server entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context providers
│   │   ├── services/    # API service functions
│   │   └── App.js       # Main App component
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

4. Start the backend server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (Admin only)
- `PUT /api/menu/:id` - Update menu item (Admin only)
- `DELETE /api/menu/:id` - Delete menu item (Admin only)

### Reservations
- `POST /api/reservations` - Create reservation (Protected)
- `GET /api/reservations` - Get reservations (Protected)
- `GET /api/reservations/:id` - Get single reservation (Protected)
- `PUT /api/reservations/:id/cancel` - Cancel reservation (Protected)

### Orders
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders` - Get orders (Protected)
- `GET /api/orders/:id` - Get single order (Protected)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Payments
- `POST /api/payments` - Create payment (Protected)
- `GET /api/payments` - Get payments (Protected)
- `GET /api/payments/:id` - Get single payment (Protected)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (Admin only)
- `GET /api/admin/reservations` - Get all reservations (Admin only)
- `GET /api/admin/orders` - Get all orders (Admin only)

## Database Models

### User
- name (String)
- email (String, unique)
- password (String, hashed)
- role (String: 'user' or 'admin')

### MenuItem
- name (String)
- description (String)
- price (Number)
- image (String)
- category (String: 'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Salad', 'Soup')
- available (Boolean)

### Reservation
- userId (ObjectId, ref: User)
- date (Date)
- time (String)
- tableSize (Number)
- orderItems (Array)
- totalPrice (Number)
- status (String: 'Pending', 'Confirmed', 'Cancelled', 'Completed')

### Order
- userId (ObjectId, ref: User)
- reservationId (ObjectId, ref: Reservation, optional)
- items (Array)
- totalPrice (Number)
- paymentStatus (String: 'Pending', 'Paid', 'Failed', 'Refunded')
- orderStatus (String: 'Pending', 'Preparing', 'Ready', 'Completed')

### Payment
- orderId (ObjectId, ref: Order)
- userId (ObjectId, ref: User)
- amount (Number)
- method (String: 'Credit Card', 'Debit Card', 'Cash', 'Online Payment')
- status (String: 'Pending', 'Completed', 'Failed', 'Refunded')
- transactionId (String)

## Creating an Admin User

To create an admin user, you can either:

1. Register through the frontend and manually update the database:
```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

2. Or use a script to create an admin user directly in the database.

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Menu**: View available menu items
3. **Add to Cart**: Select items and quantities
4. **Book Table**: Choose date, time, and table size
5. **Checkout**: Complete reservation and payment
6. **View History**: Check reservations and orders
7. **Admin Panel**: Manage menu items and view statistics (admin only)

## Notes

- The payment system is simulated - all payments succeed automatically
- Make sure MongoDB is running before starting the backend server
- JWT tokens expire after 7 days (configurable in .env)
- All API routes except registration and login require authentication
- Admin routes require both authentication and admin role

## License

This project is open source and available under the MIT License.
