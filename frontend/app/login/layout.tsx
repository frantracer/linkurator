import React from "react";
import ClientOnly from "../../components/atoms/ClientOnly";

// Rendered only in the browser: the auth links derive the API host from window.location in development
export default function AuthLayout({children}: { children: React.ReactNode }) {
  return <ClientOnly>{children}</ClientOnly>;
}
