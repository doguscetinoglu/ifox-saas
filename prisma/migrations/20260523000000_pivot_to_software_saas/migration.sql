-- Drop all old tables
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "MessageReply" CASCADE;
DROP TABLE IF EXISTS "Lead" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "SocialAccount" CASCADE;
DROP TABLE IF EXISTS "AutomationRequest" CASCADE;
DROP TABLE IF EXISTS "PaymentRequest" CASCADE;
DROP TABLE IF EXISTS "Customer" CASCADE;
DROP TABLE IF EXISTS "Package" CASCADE;

-- Drop old enums
DROP TYPE IF EXISTS "SocialPlatform";
DROP TYPE IF EXISTS "SocialAccountStatus";
DROP TYPE IF EXISTS "MessageStatus";
DROP TYPE IF EXISTS "AutomationStatus";
DROP TYPE IF EXISTS "PaymentStatus";
DROP TYPE IF EXISTS "SubscriptionStatus";

-- Update Role enum: drop OWNER, EMPLOYEE; add USER
ALTER TYPE "Role" RENAME TO "Role_old";
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING (
  CASE "role"::text
    WHEN 'ADMIN' THEN 'ADMIN'::"Role"
    ELSE 'USER'::"Role"
  END
);
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
DROP TYPE "Role_old";

-- Update UserStatus enum: remove PENDING
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
ALTER TABLE "User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "status" TYPE "UserStatus" USING (
  CASE "status"::text
    WHEN 'SUSPENDED' THEN 'SUSPENDED'::"UserStatus"
    ELSE 'ACTIVE'::"UserStatus"
  END
);
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
DROP TYPE "UserStatus_old";

-- Update User table: remove customerId, add phone
ALTER TABLE "User" DROP COLUMN IF EXISTS "customerId";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Create new enums
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED');
CREATE TYPE "AutomationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'REJECTED');

-- Create Product table
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 1000,
    "icon" TEXT NOT NULL,
    "gradient" TEXT NOT NULL,
    "isRequest" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- Create UserSubscription table
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserSubscription_userId_productId_key" ON "UserSubscription"("userId", "productId");
CREATE INDEX "UserSubscription_userId_idx" ON "UserSubscription"("userId");

-- Create PaymentRequest table
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "notifiedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PaymentRequest_status_idx" ON "PaymentRequest"("status");
CREATE INDEX "PaymentRequest_userId_idx" ON "PaymentRequest"("userId");

-- Create AutomationRequest table
CREATE TABLE "AutomationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "description" TEXT,
    "status" "AutomationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AutomationRequest_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AutomationRequest" ADD CONSTRAINT "AutomationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AutomationRequest" ADD CONSTRAINT "AutomationRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
