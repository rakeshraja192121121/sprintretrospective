// components/ClientProviders.js
"use client"; // This is essential!

import { DataProvider } from "@/contexts/DataContext"; // Your existing DataProvider
import { CombinedDataProvider } from "@/contexts/CombinedDataContext"; // <-- IMPORT THE NEW PROVIDER
import React from "react";

export function ClientProviders({ children }) {
  return (
    // Nest the providers. Order usually doesn't matter much unless one depends on the other.
    // Here, DataProvider is nested inside CombinedDataProvider, but it could be the other way around.
    <CombinedDataProvider>
      {" "}
      {/* <-- WRAP WITH THE NEW PROVIDER */}
      <DataProvider>{children}</DataProvider>
    </CombinedDataProvider>
  );
}
