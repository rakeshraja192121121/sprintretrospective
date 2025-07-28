"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Entry = {
  _id: string;
  content: string;
  createdAt: string;
};

type WorkDescContextType = {
  descriptions: Entry[];
  addDescription: (entry: { content: string }) => Promise<void>;
  editDescription: (id: string, entry: { content: string }) => Promise<void>;
  deleteDescription: (id: string) => Promise<void>;
};

const WorkDescContext = createContext<WorkDescContextType | undefined>(
  undefined
);

export const WorkDescProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [descriptions, setDescriptions] = useState<Entry[]>([]);

  useEffect(() => {
    fetch("/api/description")
      .then((res) => res.json())
      .then(setDescriptions)
      .catch(console.error);
  }, []);

  const addDescription = async ({ content }: { content: string }) => {
    const res = await fetch("/api/description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const saved = await res.json();
    setDescriptions((prev) => [saved, ...prev]);
  };

  const editDescription = async (
    id: string,
    { content }: { content: string }
  ) => {
    const res = await fetch(`/api/description/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const updated = await res.json();
    setDescriptions((prev) =>
      prev.map((entry) => (entry._id === id ? updated : entry))
    );
  };

  const deleteDescription = async (id: string) => {
    await fetch(`/api/description/${id}`, { method: "DELETE" });
    setDescriptions((prev) => prev.filter((entry) => entry._id !== id));
  };

  return (
    <WorkDescContext.Provider
      value={{
        descriptions,
        addDescription,
        editDescription,
        deleteDescription,
      }}
    >
      {children}
    </WorkDescContext.Provider>
  );
};

export const useWorkDesc = () => {
  const context = useContext(WorkDescContext);
  if (!context) {
    throw new Error("useWorkDesc must be used within a WorkDescProvider");
  }
  return context;
};
