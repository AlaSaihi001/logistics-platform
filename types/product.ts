export interface Product {
    id?: number
    nom: string
    categorie?: string
    tarifUnitaire: number
    poids: number
    largeur: number
    longueur: number
    hauteur: number
    quantite: number
    typeConditionnement: string
    fragile: boolean
    description?: string
    image?: string | File
    document?: string
  }
  