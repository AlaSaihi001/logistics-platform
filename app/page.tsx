import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl mr-6">
            <div className="bg-primary text-primary-foreground p-1 rounded">📌</div>
            LogiTech
          </Link>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
            <Link href="/services" className="text-sm font-medium hover:underline">
              Services
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:underline">
              Tarifs
            </Link>
            <Link href="/faq" className="text-sm font-medium hover:underline">
              FAQ
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:underline">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <Link href="/auth/login" className="hidden sm:inline-flex">
              <Button variant="outline" className="bg-green-500 hover:bg-green-600 text-white border-0">
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/register" className="hidden sm:inline-flex">
              <Button className="bg-blue-500 hover:bg-blue-600">S'inscrire</Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col space-y-4">
                  <Link href="/services" className="text-sm font-medium hover:underline">
                    Services
                  </Link>
                  <Link href="/pricing" className="text-sm font-medium hover:underline">
                    Tarifs
                  </Link>
                  <Link href="/faq" className="text-sm font-medium hover:underline">
                    FAQ
                  </Link>
                  <Link href="/contact" className="text-sm font-medium hover:underline">
                    Contact
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full bg-green-500 hover:bg-green-600 text-white border-0">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600">S'inscrire</Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Simplifiez vos expéditions avec notre plateforme logistique intelligente !
              </h1>
              <p className="text-muted-foreground md:text-xl max-w-[600px]">
                Gérez vos expéditions, suivez vos colis et optimisez votre logistique en quelques clics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600">
                    Commencer <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    En savoir plus
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Plateforme logistique"
                width={600}
                height={400}
                className="rounded-lg object-cover w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-muted py-12 md:py-24 lg:py-32" id="services">
          <div className="container space-y-12">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nos Services</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Des solutions logistiques adaptées à tous vos besoins
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "🚢",
                  title: "Import/Export",
                  description: "Gérez vos opérations d'import/export avec facilité et conformité.",
                },
                {
                  icon: "🚚",
                  title: "Transport",
                  description: "Solutions de transport multimodal adaptées à vos besoins spécifiques.",
                },
                {
                  icon: "🏭",
                  title: "Stockage",
                  description: "Entreposage sécurisé et gestion d'inventaire optimisée.",
                },
              ].map((service, index) => (
                <div key={index} className="bg-background p-6 rounded-lg shadow-sm">
                  <div className="mb-4 text-4xl">{service.icon}</div>
                  <h3 className="text-xl font-bold">{service.title}</h3>
                  <p className="mt-2 text-muted-foreground">{service.description}</p>
                  <Button variant="outline" className="mt-4 bg-green-500 hover:bg-green-600 text-white border-0">
                    En savoir plus
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container space-y-12">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Témoignages</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Ce que nos clients disent de nous
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  quote:
                    "LogiTech a révolutionné notre chaîne logistique. Nous avons réduit nos délais de livraison de 40%.",
                  name: "Sophie Martin",
                  role: "Directrice des Opérations, TechCorp",
                },
                {
                  quote: "Interface intuitive et support client exceptionnel. Je recommande vivement cette plateforme.",
                  name: "Thomas Dubois",
                  role: "Responsable Logistique, EcoFresh",
                },
                {
                  quote: "Grâce à LogiTech, nous avons une visibilité totale sur nos expéditions internationales.",
                  name: "Amina Benali",
                  role: "CEO, GlobalTrade",
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-muted p-6 rounded-lg">
                  <p className="italic">{testimonial.quote}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <Link href="/auth/register">
                <Button className="bg-blue-500 hover:bg-blue-600">Créer un compte</Button>
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
              <div className="bg-primary text-primary-foreground p-1 rounded">📌</div>
              LogiTech
            </Link>
            <p className="text-sm text-muted-foreground">
              Simplifiez votre logistique avec notre plateforme intelligente.
            </p>
          </div>
          {[
            { title: "Liens rapides", links: ["Services", "Tarifs", "FAQ", "Contact"] },
            { title: "Légal", links: ["Mentions légales", "Conditions générales", "Confidentialité"] },
            { title: "Réseaux sociaux", links: ["Facebook", "LinkedIn", "Twitter"] },
          ].map((column, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-medium">{column.title}</h3>
              <ul className="space-y-2 text-sm">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href="#" className="text-muted-foreground hover:underline">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="container mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LogiTech. Tous droits réservés.
        </div>
      </footer>
    </div>
  )
}
