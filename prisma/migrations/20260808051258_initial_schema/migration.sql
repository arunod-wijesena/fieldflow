-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DISPATCHER', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "TechnicianAvailability" AS ENUM ('AVAILABLE', 'BUSY', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('UNASSIGNED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkOrderPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "UserRole" NOT NULL DEFAULT 'TECHNICIAN',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availability" "TechnicianAvailability" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technician_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "WorkOrderPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'UNASSIGNED',
    "customerId" TEXT NOT NULL,
    "technicianId" TEXT,
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "completionNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_update" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "previousStatus" "WorkOrderStatus",
    "newStatus" "WorkOrderStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_update_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "customer_name_idx" ON "customer"("name");

-- CreateIndex
CREATE INDEX "customer_email_idx" ON "customer"("email");

-- CreateIndex
CREATE INDEX "customer_phone_idx" ON "customer"("phone");

-- CreateIndex
CREATE INDEX "customer_city_idx" ON "customer"("city");

-- CreateIndex
CREATE UNIQUE INDEX "technician_profile_userId_key" ON "technician_profile"("userId");

-- CreateIndex
CREATE INDEX "technician_profile_availability_idx" ON "technician_profile"("availability");

-- CreateIndex
CREATE INDEX "work_order_customerId_idx" ON "work_order"("customerId");

-- CreateIndex
CREATE INDEX "work_order_technicianId_idx" ON "work_order"("technicianId");

-- CreateIndex
CREATE INDEX "work_order_createdById_idx" ON "work_order"("createdById");

-- CreateIndex
CREATE INDEX "work_order_status_idx" ON "work_order"("status");

-- CreateIndex
CREATE INDEX "work_order_priority_idx" ON "work_order"("priority");

-- CreateIndex
CREATE INDEX "work_order_scheduledStart_idx" ON "work_order"("scheduledStart");

-- CreateIndex
CREATE INDEX "work_order_createdAt_idx" ON "work_order"("createdAt");

-- CreateIndex
CREATE INDEX "work_order_update_workOrderId_idx" ON "work_order_update"("workOrderId");

-- CreateIndex
CREATE INDEX "work_order_update_authorId_idx" ON "work_order_update"("authorId");

-- CreateIndex
CREATE INDEX "work_order_update_newStatus_idx" ON "work_order_update"("newStatus");

-- CreateIndex
CREATE INDEX "work_order_update_createdAt_idx" ON "work_order_update"("createdAt");

-- CreateIndex
CREATE INDEX "work_order_update_workOrderId_createdAt_idx" ON "work_order_update"("workOrderId", "createdAt");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_profile" ADD CONSTRAINT "technician_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technician_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order" ADD CONSTRAINT "work_order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_update" ADD CONSTRAINT "work_order_update_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_order_update" ADD CONSTRAINT "work_order_update_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
