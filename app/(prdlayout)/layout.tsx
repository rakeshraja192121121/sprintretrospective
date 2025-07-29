"use client";

import NavBar from "@/components/NavBar";
import { CombinedDataProvider } from "@/contexts/CombinedDataContext";

export default function PRDLayout({ children }: { children: React.ReactNode }) {
  return (
    <CombinedDataProvider>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-grow p-4">{children}</main>
      </div>
    </CombinedDataProvider>
  );
}
