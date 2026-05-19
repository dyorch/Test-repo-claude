import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consultorio — Gestión de Citas",
  description: "Sistema de gestión de citas para consultorio privado",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
