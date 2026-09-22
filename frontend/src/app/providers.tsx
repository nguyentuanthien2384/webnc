"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";

export default function Providers({ children }: { children: React.ReactNode }) {
  const userId = useAuthStore((state) => state.user?._id ?? "guest");
  return <SessionQueries key={userId}>{children}</SessionQueries>;
}

function SessionQueries({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
