"use client";

import NavBar from "@/components/NavBar";
import { CombinedDataProvider } from "@/contexts/CombinedDataContext";
import { GlobalDataProvider } from "../context/GlobalDataContext";

export default function PRDLayout({ children }: { children: React.ReactNode }) {
  return (
    <GlobalDataProvider>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-grow p-4">{children}</main>
      </div>
    </GlobalDataProvider>
  );
}
