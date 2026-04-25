-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STUDENT', 'STAFF', 'GUEST');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'TEMP_LOCKED', 'LOCKED');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('INITIATED', 'PARKING', 'CLOSED', 'PENDING_PAYMENT', 'PAID', 'ANOMALOUS');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('EMPTY', 'OCCUPIED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BKPAY_QR', 'CASH');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "universityId" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "debtAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RfidCard" (
    "id" UUID NOT NULL,
    "uid" TEXT NOT NULL,
    "status" "CardStatus" NOT NULL DEFAULT 'ACTIVE',
    "isGuestCard" BOOLEAN NOT NULL DEFAULT false,
    "userId" UUID,

    CONSTRAINT "RfidCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingZone" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
    "allowedRoles" "Role"[],

    CONSTRAINT "ParkingZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingSlot" (
    "id" UUID NOT NULL,
    "zoneId" UUID NOT NULL,
    "sensorCode" TEXT NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'EMPTY',
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParkingSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingPolicy" (
    "id" UUID NOT NULL,
    "role" "Role" NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingSession" (
    "id" UUID NOT NULL,
    "cardId" UUID NOT NULL,
    "zoneId" UUID,
    "checkinTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "licensePlateIn" TEXT,
    "imageInUrl" TEXT,
    "checkoutTime" TIMESTAMP(3),
    "licensePlateOut" TEXT,
    "imageOutUrl" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'INITIATED',
    "calculatedFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentId" UUID,

    CONSTRAINT "ParkingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" "PaymentMethod" NOT NULL,
    "qrCodeUrl" TEXT,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_universityId_key" ON "User"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RfidCard_uid_key" ON "RfidCard"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingZone_code_key" ON "ParkingZone"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingSlot_sensorCode_key" ON "ParkingSlot"("sensorCode");

-- AddForeignKey
ALTER TABLE "RfidCard" ADD CONSTRAINT "RfidCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSlot" ADD CONSTRAINT "ParkingSlot_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "ParkingZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "RfidCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "ParkingZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingSession" ADD CONSTRAINT "ParkingSession_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "PaymentTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
