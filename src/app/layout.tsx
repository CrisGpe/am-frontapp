import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salón Élite & Spa | CRM",
  description: "Sistema de gestión integral para salones de belleza y estética",
  metadataBase: new URL("https://am-frontapp-vzs8.vercel.app"),
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2A2118",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased selection:bg-earth-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
