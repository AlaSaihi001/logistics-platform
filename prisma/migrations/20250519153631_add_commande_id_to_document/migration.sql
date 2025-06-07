/*
  Warnings:

  - Added the required column `commandeId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document` ADD COLUMN `commandeId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_commandeId_fkey` FOREIGN KEY (`commandeId`) REFERENCES `Commande`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
