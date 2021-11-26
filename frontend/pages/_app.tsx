import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";
import "../mocks";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
