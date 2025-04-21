-- AlterTable
ALTER TABLE `document` ADD COLUMN `statut` VARCHAR(191) NOT NULL DEFAULT 'À valider';

-- AlterTable
ALTER TABLE `produit` MODIFY `categorie` VARCHAR(191) NULL;
