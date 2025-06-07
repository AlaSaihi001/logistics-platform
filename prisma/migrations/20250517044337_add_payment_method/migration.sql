/*
  Warnings:

  - You are about to drop the column `active` on the `administrateur` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `agent` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `assistant` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `client` table. All the data in the column will be lost.
  - You are about to alter the column `documents` on the `reclamation` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - Added the required column `dateArrivage` to the `Commande` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notes` to the `Commande` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `administrateur` DROP COLUMN `active`;

-- AlterTable
ALTER TABLE `agent` DROP COLUMN `active`;

-- AlterTable
ALTER TABLE `assistant` DROP COLUMN `active`;

-- AlterTable
ALTER TABLE `client` DROP COLUMN `active`;

-- AlterTable
ALTER TABLE `commande` ADD COLUMN `dateArrivage` VARCHAR(191) NOT NULL,
    ADD COLUMN `notes` JSON NOT NULL;

-- AlterTable
ALTER TABLE `reclamation` MODIFY `documents` JSON NULL;

-- CreateTable
CREATE TABLE `PaymentMethod` (
    `id` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `frais` VARCHAR(191) NOT NULL,
    `fraisFixe` VARCHAR(191) NOT NULL,
    `statut` ENUM('actif', 'inactif') NOT NULL,
    `dateCreation` DATETIME(3) NOT NULL,
    `derniereMaj` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
