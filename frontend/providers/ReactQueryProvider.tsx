"use client";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {useState} from "react";
import {shouldRetryQuery} from "../utilities/queryRetry";

function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const [client] = useState(new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryQuery,
      },
    },
  }));

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

export default ReactQueryProvider;
