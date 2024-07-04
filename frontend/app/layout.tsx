import "./styles.css";
import "tailwindcss/tailwind.css";

import ReactQueryProvider from "../providers/ReactQueryProvider";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: 'Linkurator',
  description: 'Linkurator es un agregador de contenidos donde agrupar tus fuentes favoritos en categorías ' +
    'y un buscador de contenido para encontrar lo que necesitas.',
}

export default function RootLayout(
  {
    children,
  }: {
    children: React.ReactNode
  }) {
  return (
    <html lang="en">
    <body>
    <ReactQueryProvider>
      {children}
    </ReactQueryProvider>
    </body>
    </html>
  )
}
