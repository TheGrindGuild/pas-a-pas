import type { ReactNode } from "react";
import "./globals.css";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata = {
  title: "Pas à pas",
  description: "Activités de français de base pour les élèves de 4e et 5e année.",
  icons: {
    icon: `${BASE_PATH}/favicon.svg`
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Baloo+2:wght@600;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
