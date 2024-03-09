import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {AppProps} from "next/app";
import "./styles.css";

const queryClient = new QueryClient()

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
