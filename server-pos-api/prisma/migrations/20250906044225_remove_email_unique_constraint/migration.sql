/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `passwordreset` table. All the data in the column will be lost.
  - Added the required column `code` to the `PasswordReset` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `PasswordReset_tokenHash_expiresAt_idx` ON `passwordreset`;

-- DropIndex
DROP INDEX `User_email_key` ON `user`;

-- AlterTable
ALTER TABLE `passwordreset` DROP COLUMN `tokenHash`,
    ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `PasswordReset_code_expiresAt_idx` ON `PasswordReset`(`code`, `expiresAt`);
