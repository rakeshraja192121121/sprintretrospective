"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const DataContext = createContext(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

export function DataProvider({ children }) {
  const [globalData, setGlobalData] = useState([]);
  const [descriptions, setDescriptions] = useState([]); // 🆕 For WorkDesc
  const [isAppReady, setIsAppReady] = useState(false);
  const [userId, setUserId] = useState(null);

  // 🧠 Initialize userId on client
  useEffect(() => {
    let storedUserId = localStorage.getItem("appUserId");
    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      localStorage.setItem("appUserId", storedUserId);
    }
    setUserId(storedUserId);
    setIsAppReady(true);
    console.log("DataContext: Client-side User ID:", storedUserId);
  }, []);

  // 📥 Fetch general data
  const fetchData = useCallback(async () => {
    if (!isAppReady || !userId) return;

    try {
      const res = await fetch(`/api/dataa?userId=${userId}`);
      const result = await res.json();
      if (res.ok) {
        setGlobalData(result);
      } else {
        console.error("Failed to fetch data:", result.msg || result.error);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [isAppReady, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ➕ Add globalData
  const addData = useCallback(
    async (newData) => {
      if (!userId) return alert("User ID not available.");
      try {
        const res = await fetch("/api/dataa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newData, userId }),
        });
        const result = await res.json();
        if (res.ok) {
          await fetchData();
        } else {
          console.error("Failed to add data:", result.msg || result.error);
        }
      } catch (err) {
        console.error("Error adding data:", err);
      }
    },
    [userId, fetchData]
  );

  const deleteData = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/dataa`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (res.ok) {
        setGlobalData((prev) => prev.filter((item) => item._id !== id));
      } else {
        console.error("Failed to delete data:", result.msg || result.error);
      }
    } catch (err) {
      console.error("Error deleting data:", err);
    }
  }, []);

  const editData = useCallback(async (id, updatedData) => {
    try {
      const res = await fetch(`/api/dataa`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedData }),
      });
      const result = await res.json();
      if (res.ok) {
        setGlobalData((prev) =>
          prev.map((item) => (item._id === id ? result.data : item))
        );
      } else {
        console.error("Failed to edit data:", result.msg || result.error);
      }
    } catch (err) {
      console.error("Error editing data:", err);
    }
  }, []);

  // ===========================
  // 📄 Descriptions (WorkDesc)
  // ===========================

  const fetchDescriptions = useCallback(async () => {
    try {
      const res = await fetch("/api/description");
      const data = await res.json();
      setDescriptions(data);
    } catch (err) {
      console.error("Error fetching descriptions:", err);
    }
  }, []);

  const addDescription = useCallback(async (content) => {
    try {
      const res = await fetch("/api/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const saved = await res.json();
      setDescriptions((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("Error adding description:", err);
    }
  }, []);

  const updateDescription = useCallback(async (id, content) => {
    try {
      const res = await fetch(`/api/description/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const updated = await res.json();
      setDescriptions((prev) =>
        prev.map((desc) => (desc._id === id ? updated : desc))
      );
    } catch (err) {
      console.error("Error updating description:", err);
    }
  }, []);

  const deleteDescription = useCallback(async (id) => {
    try {
      await fetch(`/api/description/${id}`, {
        method: "DELETE",
      });
      setDescriptions((prev) => prev.filter((desc) => desc._id !== id));
    } catch (err) {
      console.error("Error deleting description:", err);
    }
  }, []);

  // 👇 Context value
  const value = {
    globalData,
    addData,
    deleteData,
    editData,
    setGlobalData,
    isAppReady,
    userId,

    // 🆕 WorkDesc (descriptions)
    descriptions,
    fetchDescriptions,
    addDescription,
    updateDescription,
    deleteDescription,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
