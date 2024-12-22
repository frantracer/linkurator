import "./styles.css";
import "tailwindcss/tailwind.css";

import ReactQueryProvider from "../providers/ReactQueryProvider";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: 'Linkurator',
  description: 'Linkurator es un agregador de contenidos audiovisuales (como YouTube o Spotify) que te permite organizar tus suscripciones en categorías'
  + 'También puedes compartir tus categorías y recomendar contenidos. De esta forma puedes convertirte en un curador de contenido y compartir tus gustos con el mundo.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
    shortcut: '/icon.png',
  },
}

export default function RootLayout(
  {
    children,
  }: {
    children: React.ReactNode
  }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="Linkurator" />
      </head>
    <body>
    <ReactQueryProvider>
      {children}
    </ReactQueryProvider>
    </body>
    </html>
  )
}
