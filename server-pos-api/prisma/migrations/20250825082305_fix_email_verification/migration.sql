/*
  Warnings:

  - Added the required column `userId` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `emailverification` ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `verified` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `EmailVerification` ADD CONSTRAINT `EmailVerification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
