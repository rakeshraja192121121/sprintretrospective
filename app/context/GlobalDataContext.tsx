"use client";
import React, { createContext, useContext, useState } from "react";

const GlobalDataContext = createContext();

export const GlobalDataProvider = ({ children }) => {
  const [globalData, setGlobalData] = useState({
    versionHistory: {},
    introduction: {},
    quicklinks: {},
    // Add others here
  });

  const updateSection = (section, data) => {
    setGlobalData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  return (
    <GlobalDataContext.Provider value={{ globalData, updateSection }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

export const useGlobalData = () => useContext(GlobalDataContext);
