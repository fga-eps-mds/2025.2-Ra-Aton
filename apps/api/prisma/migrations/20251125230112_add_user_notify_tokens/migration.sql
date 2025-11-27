-- CreateTable
CREATE TABLE "UsersNotifyTokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsersNotifyTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsersNotifyTokens_userId_key" ON "UsersNotifyTokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UsersNotifyTokens_token_key" ON "UsersNotifyTokens"("token");

-- AddForeignKey
ALTER TABLE "UsersNotifyTokens" ADD CONSTRAINT "UsersNotifyTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
