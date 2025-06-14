import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Truck,
  Ship,
  Plane,
  Package,
  Globe,
  Shield,
  Clock,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function ServicesPage() {
  const services = [
    {
      icon: Ship,
      title: "Transport Maritime",
      description:
        "Solutions de fret maritime pour vos expéditions internationales",
      features: [
        "Conteneurs FCL et LCL",
        "Suivi en temps réel",
        "Assurance cargo",
        "Dédouanement inclus",
      ],
      price: "À partir de 1,200€",
    },
    {
      icon: Plane,
      title: "Transport Aérien",
      description: "Expéditions rapides par voie aérienne pour vos urgences",
      features: [
        "Livraison express 24-48h",
        "Marchandises sensibles",
        "Suivi GPS",
        "Service porte-à-porte",
      ],
      price: "À partir de 2,500€",
    },
    {
      icon: Truck,
      title: "Transport Routier",
      description: "Solutions de transport terrestre flexibles et économiques",
      features: [
        "Camions complets et groupage",
        "Livraison programmée",
        "Transport frigorifique",
        "Manutention spécialisée",
      ],
      price: "À partir de 350€",
    },
    {
      icon: Package,
      title: "Entreposage",
      description: "Stockage sécurisé et gestion d'inventaire optimisée",
      features: [
        "Entrepôts climatisés",
        "Gestion WMS",
        "Préparation de commandes",
        "Cross-docking",
      ],
      price: "À partir de 15€/m³/mois",
    },
    {
      icon: Globe,
      title: "Douane & Réglementation",
      description: "Expertise douanière pour vos opérations internationales",
      features: [
        "Déclarations douanières",
        "Conseil réglementaire",
        "Certificats d'origine",
        "Gestion des taxes",
      ],
      price: "À partir de 150€",
    },
    {
      icon: Shield,
      title: "Assurance Cargo",
      description: "Protection complète de vos marchandises en transit",
      features: [
        "Couverture tous risques",
        "Indemnisation rapide",
        "Expertise sinistres",
        "Conseil en prévention",
      ],
      price: "0.1% à 0.5% de la valeur",
    },
  ];

  const advantages = [
    {
      icon: Clock,
      title: "Rapidité",
      description: "Délais de livraison optimisés grâce à notre réseau mondial",
    },
    {
      icon: Shield,
      title: "Sécurité",
      description:
        "Vos marchandises sont protégées à chaque étape du transport",
    },
    {
      icon: Users,
      title: "Expertise",
      description: "Une équipe d'experts dédiée à votre réussite logistique",
    },
    {
      icon: Globe,
      title: "Couverture Mondiale",
      description: "Présence dans plus de 150 pays à travers le monde",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl mr-6"
          >
            <div className="bg-primary text-primary-foreground p-1 rounded">
              <Image
                src="logo.png"
                alt="logo"
                width={30}
                height={30}
                className="rounded-lg object-cover w-10 h-10"
              ></Image>
            </div>
            Cargo Express
          </Link>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
            <Link href="/services" className="text-sm font-medium text-primary">
              Services
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium hover:underline"
            >
              Tarifs
            </Link>
            <Link href="/faq" className="text-sm font-medium hover:underline">
              FAQ
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium hover:underline"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2 ml-auto">
            <Link href="/auth/login">
              <Button
                variant="outline"
                className="bg-green-500 hover:bg-green-600 text-white border-0"
              >
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-blue-500 hover:bg-blue-600">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Nos Services Logistiques
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Des solutions complètes pour tous vos besoins de transport et
                logistique
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Demander un devis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary">{service.price}</Badge>
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full mt-6" variant="outline">
                      En savoir plus
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Advantages Section */}
        <section className="bg-muted py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pourquoi choisir Cargo Express ?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Nous nous distinguons par notre expertise et notre engagement
                envers l'excellence
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {advantages.map((advantage, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <advantage.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {advantage.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {advantage.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à optimiser votre logistique ?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Contactez nos experts pour une solution personnalisée
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" variant="secondary">
                    Nous contacter
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-orange-500 hover:bg-white hover:text-orange-800"
                  >
                    Créer un compte
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted py-8 md:py-12">
        <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <div className="bg-primary text-primary-foreground p-1 rounded">
                📌
              </div>
              Cargo Express
            </Link>
            <p className="text-sm text-muted-foreground">
              Simplifiez votre logistique avec notre plateforme intelligente.
            </p>
          </div>
          {[
            {
              title: "Liens rapides",
              links: ["Services", "Tarifs", "FAQ", "Contact"],
            },
            {
              title: "Légal",
              links: [
                "Mentions légales",
                "Conditions générales",
                "Confidentialité",
              ],
            },
            {
              title: "Réseaux sociaux",
              links: ["Facebook", "LinkedIn", "Twitter"],
            },
          ].map((column, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-medium">{column.title}</h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:underline"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="container mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Cargo Express. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
