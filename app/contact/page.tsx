"use client";

import type React from "react";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Message envoyé !",
      description: "Nous vous répondrons dans les plus brefs délais.",
    });

    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Adresse",
      details: ["123 Avenue de la Logistique", "75001 Paris, France"],
    },
    {
      icon: Phone,
      title: "Téléphone",
      details: ["+216 92 367 081", "+216 92 367 081 (Urgences)"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["contact@cargoexpress.com", "support@cargoexpress.com"],
    },
    {
      icon: Clock,
      title: "Horaires",
      details: ["Lun-Ven: 8h00 - 20h00", "Sam: 9h00 - 17h00"],
    },
  ];

  const offices = [
    {
      city: "Tunisie",
      address: "123 Avenue de la Logistique, 75001 Paris",
      phone: "+216 92 367 081",
      email: "tn@cargoexpress.com",
    },
    {
      city: "USA",
      address: "456 Rue du Commerce, 69000 Lyon",
      phone: "+216 92 367 081",
      email: "usa@cargoexpress.com",
    },
    {
      city: "France",
      address: "789 Boulevard Maritime, 13000 Marseille",
      phone: "+216 29 693 880",
      email: "fr@cargoexpress.com",
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
            <Link
              href="/pricing"
              className="text-sm font-medium hover:underline"
            >
              Tarifs
            </Link>
            <Link href="/faq" className="text-sm font-medium hover:underline">
              FAQ
            </Link>
            <Link href="/contact" className="text-sm font-medium text-primary">
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
        <section className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Contactez-nous
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Notre équipe d'experts est à votre disposition pour répondre à
                toutes vos questions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-teal-600 hover:bg-white hover:text-teal-800"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Appeler maintenant
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Envoyez-nous un message
                </h2>
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom *</Label>
                          <Input id="firstName" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom *</Label>
                          <Input id="lastName" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" type="tel" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Entreprise</Label>
                        <Input id="company" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Sujet *</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisissez un sujet" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="devis">
                              Demande de devis
                            </SelectItem>
                            <SelectItem value="info">
                              Informations générales
                            </SelectItem>
                            <SelectItem value="support">
                              Support technique
                            </SelectItem>
                            <SelectItem value="partenariat">
                              Partenariat
                            </SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Décrivez votre demande en détail..."
                          className="min-h-[120px]"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Envoi en cours..."
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold mb-6">Nos coordonnées</h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <info.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-2">
                              {info.title}
                            </h3>
                            {info.details.map((detail, detailIndex) => (
                              <p
                                key={detailIndex}
                                className="text-muted-foreground"
                              >
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Offices */}
        <section className="bg-muted py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nos Bureaux
              </h2>
              <p className="text-xl text-muted-foreground">
                Retrouvez-nous dans nos différentes agences en France
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {offices.map((office, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-xl">{office.city}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        {office.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm">{office.phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm">{office.email}</p>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Voir sur la carte
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Quick Links */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Questions Fréquentes
              </h2>
              <p className="text-xl text-muted-foreground">
                Consultez notre FAQ pour des réponses rapides
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
              {[
                {
                  question: "Comment calculer le coût d'une expédition ?",
                  answer: "Utilisez notre calculateur en ligne gratuit",
                },
                {
                  question: "Quels sont vos délais de livraison ?",
                  answer:
                    "Variables selon la destination et le mode de transport",
                },
                {
                  question: "Proposez-vous une assurance cargo ?",
                  answer: "Oui, nous offrons plusieurs options d'assurance",
                },
                {
                  question: "Comment suivre mon expédition ?",
                  answer: "Via votre espace client ou notre app mobile",
                },
                {
                  question: "Acceptez-vous tous types de marchandises ?",
                  answer: "La plupart, avec quelques restrictions légales",
                },
                {
                  question: "Avez-vous une API pour l'intégration ?",
                  answer: "Oui, documentation complète disponible",
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                    <CardDescription>{faq.answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/faq">
                <Button variant="outline" size="lg">
                  Voir toutes les questions
                </Button>
              </Link>
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
