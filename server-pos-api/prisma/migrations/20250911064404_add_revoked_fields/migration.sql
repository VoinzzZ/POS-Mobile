-- AlterTable
ALTER TABLE `registrationpin` ADD COLUMN `revokedAt` DATETIME(3) NULL,
    ADD COLUMN `revokedById` INTEGER NULL;
