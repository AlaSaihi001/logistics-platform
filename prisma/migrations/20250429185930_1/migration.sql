/*
  Warnings:

  - You are about to alter the column `documents` on the `reclamation` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `reclamation` MODIFY `documents` JSON NULL;
