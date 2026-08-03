-- CreateTable
CREATE TABLE "AdminLoginAttempt" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "firstAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminLoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminLoginAttempt_email_idx" ON "AdminLoginAttempt"("email");

-- CreateIndex
CREATE INDEX "AdminLoginAttempt_lockedUntil_idx" ON "AdminLoginAttempt"("lockedUntil");

-- CreateIndex
CREATE UNIQUE INDEX "AdminLoginAttempt_identifier_email_key" ON "AdminLoginAttempt"("identifier", "email");
