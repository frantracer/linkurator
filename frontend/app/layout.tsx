import "./styles.css";
import "tailwindcss/tailwind.css";

import ReactQueryProvider from "../providers/ReactQueryProvider";

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
