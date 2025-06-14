import Link from "next/link";
import { ChevronDown, Search, MessageCircle, Phone, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export default function FAQPage() {
  const faqCategories = [
    {
      title: "Général",
      questions: [
        {
          question: "Qu'est-ce que Cargo Express ?",
          answer:
            "Cargo Express est une plateforme logistique intelligente qui vous permet de gérer vos expéditions, suivre vos colis et optimiser votre chaîne d'approvisionnement en quelques clics.",
        },
        {
          question: "Dans quels pays opérez-vous ?",
          answer:
            "Nous opérons dans plus de 150 pays à travers le monde. Notre réseau couvre l'Europe, l'Amérique du Nord et du Sud, l'Asie, l'Afrique et l'Océanie.",
        },
        {
          question: "Comment puis-je créer un compte ?",
          answer:
            "Cliquez sur 'S'inscrire' en haut de la page, remplissez le formulaire avec vos informations et validez votre email. Vous pourrez ensuite accéder à votre tableau de bord.",
        },
      ],
    },
    {
      title: "Expéditions",
      questions: [
        {
          question: "Quels types de marchandises puis-je expédier ?",
          answer:
            "Nous acceptons la plupart des marchandises légales, y compris les produits manufacturés, les matières premières, les denrées alimentaires non périssables, et les équipements industriels. Les marchandises dangereuses nécessitent une autorisation spéciale.",
        },
        {
          question: "Comment calculez-vous les coûts d'expédition ?",
          answer:
            "Les coûts sont calculés en fonction du poids, des dimensions, de la destination, du mode de transport choisi et des services additionnels. Utilisez notre calculateur en ligne pour obtenir un devis instantané.",
        },
        {
          question: "Puis-je suivre mes expéditions en temps réel ?",
          answer:
            "Oui, toutes nos expéditions sont équipées d'un système de suivi GPS. Vous recevez des notifications automatiques à chaque étape importante du transport.",
        },
        {
          question: "Que faire si ma marchandise est endommagée ?",
          answer:
            "Contactez immédiatement notre service client avec les photos des dommages. Si vous avez souscrit à notre assurance cargo, nous traiterons votre réclamation dans les 48h.",
        },
      ],
    },
    {
      title: "Tarifs et Paiements",
      questions: [
        {
          question: "Quels sont vos modes de paiement acceptés ?",
          answer:
            "Nous acceptons les cartes de crédit (Visa, MasterCard, American Express), les virements bancaires, PayPal et les paiements par lettre de crédit pour les gros volumes.",
        },
        {
          question:
            "Proposez-vous des tarifs préférentiels pour les gros volumes ?",
          answer:
            "Oui, nous offrons des tarifs dégressifs basés sur le volume mensuel d'expéditions. Contactez notre équipe commerciale pour obtenir un devis personnalisé.",
        },
        {
          question: "Y a-t-il des frais cachés ?",
          answer:
            "Non, tous nos tarifs sont transparents. Les seuls frais supplémentaires possibles sont les taxes douanières (à la charge du destinataire) et les services optionnels que vous choisissez.",
        },
        {
          question: "Puis-je obtenir une facture détaillée ?",
          answer:
            "Oui, toutes vos factures sont disponibles dans votre espace client avec le détail de chaque service utilisé. Vous pouvez les télécharger en PDF.",
        },
      ],
    },
    {
      title: "Douanes et Réglementation",
      questions: [
        {
          question: "Vous occupez-vous des formalités douanières ?",
          answer:
            "Oui, notre équipe d'experts en douane s'occupe de toutes les formalités pour vos expéditions internationales, incluant les déclarations et le paiement des taxes.",
        },
        {
          question: "Quels documents dois-je fournir ?",
          answer:
            "Les documents requis varient selon la destination et le type de marchandise. Généralement : facture commerciale, liste de colisage, certificat d'origine si nécessaire.",
        },
        {
          question: "Combien de temps prend le dédouanement ?",
          answer:
            "Le dédouanement standard prend 1-3 jours ouvrables. Nous proposons un service express qui réduit ce délai à 24h moyennant un supplément.",
        },
      ],
    },
    {
      title: "Support Technique",
      questions: [
        {
          question: "Comment contacter le support client ?",
          answer:
            "Vous pouvez nous contacter par email (support@cargoexpress.com), téléphone (+33 1 23 45 67 89), ou via le chat en direct disponible 24h/7j.",
        },
        {
          question: "Proposez-vous une API pour l'intégration ?",
          answer:
            "Oui, nous proposons une API complète pour intégrer nos services à vos systèmes existants. La documentation est disponible dans votre espace développeur.",
        },
        {
          question: "Puis-je importer mes données depuis un autre système ?",
          answer:
            "Non, pour le moment, nous proposons des outils d'import pour la plupart des formats standards (CSV, Excel, XML). Notre équipe technique peut vous assister dans la migration.",
        },
      ],
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
              📌
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
            <Link
              href="/pricing"
              className="text-sm font-medium hover:underline"
            >
              Tarifs
            </Link>
            <Link href="/faq" className="text-sm font-medium text-primary">
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
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Questions Fréquentes
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Trouvez rapidement les réponses à vos questions
              </p>
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une question..."
                  className="pl-10 bg-white text-black"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20">
          <div className="container max-w-4xl">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-primary">
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <Collapsible key={faqIndex}>
                      <Card>
                        <CollapsibleTrigger className="w-full">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-left text-lg font-medium">
                              {faq.question}
                            </CardTitle>
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-muted py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Vous ne trouvez pas votre réponse ?
              </h2>
              <p className="text-xl text-muted-foreground">
                Notre équipe support est là pour vous aider
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Téléphone</CardTitle>
                  <CardDescription>Lun-Ven 8h-20h</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    +216 92 367 081
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Email</CardTitle>
                  <CardDescription>Réponse sous 2h</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    support@cargoexpress.com
                  </Button>
                </CardContent>
              </Card>
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
