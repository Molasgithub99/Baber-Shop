import { PrismaClient } from "@prisma/client"; // Import the PrismaClient class from the @prisma/client package

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"], // Configure logging based on the environment (development or production)
}); // Create a new instance of PrismaClient


// The connectDB function attempts to connect to the database using Prisma. If successful, it logs a success message; if it fails, it logs the error and exits the process with a failure code.
const connectDB = async () => {
    try {
        await prisma.$connect(); // Attempt to connect to the database 
        console.log("✅ DB connected successfully via Prisma"); // Log a success message if the connection is successful
    } catch (error) {
        console.error(`❌ DB connection failed: ${error.message}`);
        process.exit(1); // Exit the process with a failure code if the connection fails
    }
}


// The disconnectDB function attempts to disconnect from the database using Prisma. If successful, it logs a success message; if it fails, it logs the error and exits the process with a failure code.
const disconnectDB = async () => {
    try {
        await prisma.$disconnect(); // Attempt to disconnect from the database
        console.log("DB disconnected successfully via Prisma"); // Log a success message if the disconnection is successful
    } catch (error) {
        console.error(`DB disconnection failed: ${error.message}`);
        process.exit(1); // Exit the process with a failure code if the disconnection fails
    }
}

export { connectDB, disconnectDB, prisma }; // Export the connectDB, disconnectDB functions and the prisma instance for use in other parts of the application




// Claude implementation of the database connection and disconnection logic using Prisma. The code defines a `PrismaClient` instance, configures logging based on the environment, and provides functions to connect and disconnect from the database. It also includes error handling to log any issues during connection or disconnection attempts. The `connectDB`, `disconnectDB`, and `prisma` instance are exported for use in other parts of the application.
// src/config/db.js
// const { PrismaClient } = require('@prisma/client');

// Prevent multiple PrismaClient instances during nodemon hot-reloads in dev
// const globalForPrisma = globalThis;

// const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
//   });

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma;
// }

// module.exports = prisma;