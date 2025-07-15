require('dotenv').config(); // Load environment variables at the very beginning
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to database
connectDB();

// Middleware
// src/app.js
const corsOptions = {
  origin: '*', // <--- Allows requests from ANY origin. Use with caution in production.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Note: credentials cannot be used with '*'
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json()); // Body parser for JSON requests

// API Routes
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

// Catch-all for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
});