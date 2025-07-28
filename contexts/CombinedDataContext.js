"use client";

import { createContext, useContext, useState } from "react";

const CombinedDataContext = createContext();

export const CombinedDataProvider = ({ children }) => {
  const [isCombinedSaving, setIsCombinedSaving] = useState(false);

  const saveCombinedData = async (data) => {
    try {
      setIsCombinedSaving(true);
      const res = await fetch("/api/combined-saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save");
      console.log("Combined data saved successfully:", result);
    } catch (err) {
      console.error("Error saving combined data:", err);
    } finally {
      setIsCombinedSaving(false);
    }
  };

  return (
    <CombinedDataContext.Provider
      value={{ saveCombinedData, isCombinedSaving }}
    >
      {children}
    </CombinedDataContext.Provider>
  );
};

export const useCombinedData = () => useContext(CombinedDataContext);
