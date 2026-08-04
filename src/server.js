import express from 'express';
import { config } from 'dotenv'; // Import the config function from dotenv
import cookieParser from 'cookie-parser'; // Import the cookie-parser middleware
import cors from 'cors';


import { connectDB, disconnectDB } from './config/db.js'; // Import the connectDB and disconnectDB functions from db.js
import {notFound, errorHandler } from './middleware/errorMiddleware.js'; // Import the errorHandler & not found error middleware


//Import Routes
import authRoutes from './routes/authRoute.js';
import userRoutes from './routes/userRoute.js';
import bookingRoutes from './routes/bookingRoute.js';
import barberRoutes from './routes/baberRoute.js';
import serviceRoutes from './routes/serviceRoute.js';
import aboutRoutes from './routes/aboutRoute.js';
import contactRoutes from './routes/contactRoute.js';



config(); // Load environment variables from .env file
connectDB(); // Connect to the database

const app = express(); // initialize express app

//Body parser middlewares
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests
app.use(cookieParser()); // cookie parser middleware to parse cookies from incoming requests
app.use(cors({
  origin: process.env.CLIENT_URL, // http://localhost:5173
  credentials: true, // allows cookies to be sent/received cross-origin
}));

//API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/bookings', bookingRoutes);
app.use('/barbers', barberRoutes);
app.use('/services', serviceRoutes);
app.use('/about', aboutRoutes);
app.use('/contact', contactRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = 5001;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//Handle unhandled promise rejections(eg: database connection errors)
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection at Promise: ${promise}, Error: ${err.message}`);
    server.close(async () => {
        await disconnectDB();
        process.exit(1); // Exit the process with a failure code
    });
});

//Handle uncaught exceptions (eg: synchronous errors)
process.on('uncaughtException', async (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    await disconnectDB();
    process.exit(1); // Exit the process with a failure code
});

//Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT signal. Shutting down gracefully...');
    await disconnectDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal. Shutting down gracefully...');
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});