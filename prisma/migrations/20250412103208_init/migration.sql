-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `indicatifPaysTelephone` VARCHAR(191) NOT NULL,
    `telephone` INTEGER NOT NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'CLIENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Client_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assistant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `indicatifPaysTelephone` VARCHAR(191) NOT NULL,
    `telephone` INTEGER NOT NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'ASSISTANT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Assistant_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Agent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `indicatifPaysTelephone` VARCHAR(191) NOT NULL,
    `telephone` INTEGER NOT NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'AGENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Agent_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Administrateur` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `prenom` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `indicatifPaysTelephone` VARCHAR(191) NOT NULL,
    `telephone` INTEGER NOT NULL,
    `motDePasse` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Administrateur_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commande` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `assistantId` INTEGER NULL,
    `agentId` INTEGER NULL,
    `nom` VARCHAR(191) NOT NULL,
    `pays` VARCHAR(191) NOT NULL,
    `adresse` VARCHAR(191) NOT NULL,
    `dateDePickup` DATETIME(3) NOT NULL,
    `valeurMarchandise` DOUBLE NOT NULL,
    `typeCommande` VARCHAR(191) NOT NULL,
    `typeTransport` VARCHAR(191) NOT NULL,
    `ecoterme` VARCHAR(191) NOT NULL,
    `modePaiement` VARCHAR(191) NOT NULL,
    `nomDestinataire` VARCHAR(191) NOT NULL,
    `paysDestinataire` VARCHAR(191) NOT NULL,
    `adresseDestinataire` VARCHAR(191) NOT NULL,
    `indicatifTelephoneDestinataire` VARCHAR(191) NOT NULL,
    `telephoneDestinataire` INTEGER NOT NULL,
    `emailDestinataire` VARCHAR(191) NOT NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'En attente',
    `adresseActuel` VARCHAR(191) NULL,
    `dateCommande` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idCommande` INTEGER NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `categorie` VARCHAR(191) NOT NULL,
    `tarifUnitaire` DOUBLE NOT NULL,
    `poids` DOUBLE NOT NULL,
    `largeur` DOUBLE NOT NULL,
    `longueur` DOUBLE NOT NULL,
    `hauteur` DOUBLE NOT NULL,
    `quantite` INTEGER NOT NULL,
    `typeConditionnement` VARCHAR(191) NOT NULL,
    `fragile` BOOLEAN NOT NULL DEFAULT false,
    `description` TEXT NULL,
    `image` VARCHAR(191) NULL,
    `document` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Facture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idCommande` INTEGER NOT NULL,
    `idClient` INTEGER NOT NULL,
    `idAgent` INTEGER NULL,
    `document` VARCHAR(191) NULL,
    `numeroFacture` INTEGER NOT NULL,
    `montant` DOUBLE NOT NULL,
    `dateEmission` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'En attente',
    `assistantId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Facture_numeroFacture_key`(`numeroFacture`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Paiement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idFacture` INTEGER NOT NULL,
    `clientId` INTEGER NOT NULL,
    `modePaiement` VARCHAR(191) NOT NULL,
    `statut` VARCHAR(191) NOT NULL DEFAULT 'En attente',
    `datePaiement` DATETIME(3) NULL,
    `montant` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Paiement_idFacture_key`(`idFacture`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dateEmission` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` VARCHAR(191) NOT NULL,
    `correspond` VARCHAR(191) NOT NULL,
    `lu` BOOLEAN NOT NULL DEFAULT false,
    `clientId` INTEGER NULL,
    `assistantId` INTEGER NULL,
    `agentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reclamation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idClient` INTEGER NOT NULL,
    `assistantId` INTEGER NULL,
    `description` TEXT NOT NULL,
    `documents` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Ouverte',
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sujet` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idAgent` INTEGER NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `size` DOUBLE NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogisticsIncident` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `severity` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `reportedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `resolvedAt` DATETIME(3) NULL,
    `shipmentId` VARCHAR(191) NULL,
    `warehouseId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LogisticsIncident_type_idx`(`type`),
    INDEX `LogisticsIncident_status_idx`(`status`),
    INDEX `LogisticsIncident_shipmentId_idx`(`shipmentId`),
    INDEX `LogisticsIncident_warehouseId_idx`(`warehouseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shipment` (
    `id` VARCHAR(191) NOT NULL,
    `trackingNumber` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `transportMode` VARCHAR(191) NOT NULL,
    `origin` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `departureDate` DATETIME(3) NULL,
    `arrivalDate` DATETIME(3) NULL,
    `estimatedArrival` DATETIME(3) NULL,
    `distance` DOUBLE NULL,
    `weight` DOUBLE NULL,
    `volume` DOUBLE NULL,
    `cost` DOUBLE NULL,
    `region` VARCHAR(191) NULL,
    `warehouseId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Shipment_trackingNumber_key`(`trackingNumber`),
    INDEX `Shipment_status_idx`(`status`),
    INDEX `Shipment_transportMode_idx`(`transportMode`),
    INDEX `Shipment_warehouseId_idx`(`warehouseId`),
    INDEX `Shipment_region_idx`(`region`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Warehouse` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `capacity` INTEGER NOT NULL,
    `type` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Warehouse_location_idx`(`location`),
    INDEX `Warehouse_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_assistantId_fkey` FOREIGN KEY (`assistantId`) REFERENCES `Assistant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commande` ADD CONSTRAINT `Commande_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `Agent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Produit` ADD CONSTRAINT `Produit_idCommande_fkey` FOREIGN KEY (`idCommande`) REFERENCES `Commande`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Facture` ADD CONSTRAINT `Facture_idCommande_fkey` FOREIGN KEY (`idCommande`) REFERENCES `Commande`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Facture` ADD CONSTRAINT `Facture_idClient_fkey` FOREIGN KEY (`idClient`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Facture` ADD CONSTRAINT `Facture_idAgent_fkey` FOREIGN KEY (`idAgent`) REFERENCES `Agent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Facture` ADD CONSTRAINT `Facture_assistantId_fkey` FOREIGN KEY (`assistantId`) REFERENCES `Assistant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Paiement` ADD CONSTRAINT `Paiement_idFacture_fkey` FOREIGN KEY (`idFacture`) REFERENCES `Facture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Paiement` ADD CONSTRAINT `Paiement_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_assistantId_fkey` FOREIGN KEY (`assistantId`) REFERENCES `Assistant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `Agent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reclamation` ADD CONSTRAINT `Reclamation_idClient_fkey` FOREIGN KEY (`idClient`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reclamation` ADD CONSTRAINT `Reclamation_assistantId_fkey` FOREIGN KEY (`assistantId`) REFERENCES `Assistant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_idAgent_fkey` FOREIGN KEY (`idAgent`) REFERENCES `Agent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogisticsIncident` ADD CONSTRAINT `LogisticsIncident_shipmentId_fkey` FOREIGN KEY (`shipmentId`) REFERENCES `Shipment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogisticsIncident` ADD CONSTRAINT `LogisticsIncident_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shipment` ADD CONSTRAINT `Shipment_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
