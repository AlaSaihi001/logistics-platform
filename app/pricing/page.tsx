import Link from "next/link";
import { Check, X, Star, ArrowRight } from "lucide-react";

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

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "99",
      period: "mois",
      description: "Parfait pour les petites entreprises qui débutent",
      popular: false,
      features: [
        { name: "Jusqu'à 50 expéditions/mois", included: true },
        { name: "Suivi basique", included: true },
        { name: "Support email", included: true },
        { name: "1 utilisateur", included: true },
        { name: "Rapports mensuels", included: true },
        { name: "API d'intégration", included: false },
        { name: "Support téléphonique", included: false },
        { name: "Gestionnaire dédié", included: false },
      ],
    },
    {
      name: "Professional",
      price: "299",
      period: "mois",
      description: "Idéal pour les entreprises en croissance",
      popular: true,
      features: [
        { name: "Jusqu'à 500 expéditions/mois", included: true },
        { name: "Suivi avancé en temps réel", included: true },
        { name: "Support email et chat", included: true },
        { name: "5 utilisateurs", included: true },
        { name: "Rapports détaillés", included: true },
        { name: "API d'intégration", included: true },
        { name: "Support téléphonique", included: true },
        { name: "Gestionnaire dédié", included: false },
      ],
    },
    {
      name: "Enterprise",
      price: "799",
      period: "mois",
      description: "Pour les grandes entreprises avec des besoins complexes",
      popular: false,
      features: [
        { name: "Expéditions illimitées", included: true },
        { name: "Suivi premium multi-modal", included: true },
        { name: "Support prioritaire 24/7", included: true },
        { name: "Utilisateurs illimités", included: true },
        { name: "Analytics avancés", included: true },
        { name: "API complète", included: true },
        { name: "Support téléphonique prioritaire", included: true },
        { name: "Gestionnaire dédié", included: true },
      ],
    },
  ];

  const additionalServices = [
    {
      name: "Assurance Cargo",
      description: "Protection complète de vos marchandises",
      price: "0.1% - 0.5% de la valeur",
    },
    {
      name: "Dédouanement Express",
      description: "Traitement prioritaire des formalités douanières",
      price: "150€ par déclaration",
    },
    {
      name: "Entreposage",
      description: "Stockage sécurisé dans nos entrepôts",
      price: "15€/m³/mois",
    },
    {
      name: "Emballage Spécialisé",
      description: "Conditionnement adapté à vos produits",
      price: "Sur devis",
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
            <Link
              href="/services"
              className="text-sm font-medium hover:underline"
            >
              Services
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-primary">
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
        <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Tarifs Transparents
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Choisissez le plan qui correspond à vos besoins logistiques
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}

        {/* Additional Services */}
        <section className="bg-muted py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Services Populaire
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Complétez votre solution logistique avec nos services
                spécialisés
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {additionalServices.map((service, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-4">
                      {service.price}
                    </div>
                    <Button variant="outline" className="w-full">
                      En savoir plus
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Questions Fréquentes sur les Tarifs
              </h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: "Puis-je changer de plan à tout moment ?",
                  answer:
                    "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.",
                },
                {
                  question: "Y a-t-il des frais cachés ?",
                  answer:
                    "Non, nos tarifs sont transparents. Tous les coûts sont clairement indiqués et il n'y a aucun frais caché.",
                },
                {
                  question:
                    "Que se passe-t-il si je dépasse ma limite d'expéditions ?",
                  answer:
                    "Nous vous contacterons pour vous proposer un upgrade vers un plan supérieur ou vous facturerons les expéditions supplémentaires au tarif unitaire.",
                },
                {
                  question:
                    "Proposez-vous des remises pour les contrats annuels ?",
                  answer:
                    "Oui, nous offrons 15% de réduction sur tous nos plans pour les engagements annuels.",
                },
              ].map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Prêt à commencer ?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Essayez Cargo Express gratuitement pendant 30 jours, sans
                engagement
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary">
                    Commencer l'essai gratuit{" "}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-purple-600 hover:bg-white hover:text-purple-800"
                  >
                    Parler à un expert
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
