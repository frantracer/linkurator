import "./styles.css";
import "tailwindcss/tailwind.css";

import ReactQueryProvider from "../providers/ReactQueryProvider";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: 'Linkurator',
  description: 'Linkurator is a tool to organize and share your favorite links.',
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
