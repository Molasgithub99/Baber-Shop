-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "confirmationToken" TEXT,
ADD COLUMN     "confirmationTokenExpiry" TIMESTAMP(3);
