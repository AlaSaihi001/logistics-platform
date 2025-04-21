import type React from "react";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

export const metadata = {
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {" "}
          {/* ✅ contexte d'authentification personnalisé */}
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
