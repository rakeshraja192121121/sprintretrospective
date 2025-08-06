"use client";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setStakeholders,
  addStakeholder,
  updateStakeholder,
  deleteStakeholder,
} from "../store/stakeholdersSlice";

export default function Stakeholders() {
  const stakeholders = useSelector((state) => state.stakeholders);
  const dispatch = useDispatch();

  // Load from localStorage once on mount and init Redux
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("stakeholders"));
    if (saved && Array.isArray(saved)) {
      dispatch(
        setStakeholders([
          ...saved,
          { role: "", name: "" },
          { role: "", name: "" },
        ])
      );
    } else {
      dispatch(
        setStakeholders([
          { role: "", name: "" },
          { role: "", name: "" },
        ])
      );
    }
  }, [dispatch]);

  // Persist to localStorage whenever stakeholders change
  useEffect(() => {
    const filled = stakeholders.filter((s) => s.role || s.name);
    localStorage.setItem("stakeholders", JSON.stringify(filled));
  }, [stakeholders]);

  const handleChange = (index, field, value) => {
    const updated = [...stakeholders];
    updated[index] = { ...updated[index], [field]: value };

    const cleaned = updated.filter((item) => item.role || item.name);
    while (
      cleaned.length < updated.length ||
      cleaned.slice(-2).filter((s) => s.role || s.name).length > 0
    ) {
      cleaned.push({ role: "", name: "" });
    }

    dispatch(setStakeholders(cleaned));
  };

  const handleBlur = () => {
    const filtered = stakeholders.filter(
      (item, index) =>
        item.role || item.name || index >= stakeholders.length - 2
    );
    dispatch(setStakeholders(filtered));
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h2 className="text-2xl font-semibold mb-6">Stakeholders</h2>

      {/* Header Row */}
      <div className="grid grid-cols-2 gap-4 pb-2 border-b font-semibold text-gray-700">
        <div>Role</div>
        <div>Name</div>
      </div>

      {/* Input Rows */}
      <div className="space-y-1 mt-2">
        {stakeholders.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-2 gap-4 border-b border-gray-300 py-2 hover:bg-gray-50 focus-within:bg-gray-50 transition-all duration-300"
            onBlur={handleBlur}
          >
            <input
              type="text"
              value={item.role}
              onChange={(e) => handleChange(idx, "role", e.target.value)}
              className="w-full bg-transparent outline-none text-black transition-all duration-200 border-b border-transparent focus:border-gray-400"
            />
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleChange(idx, "name", e.target.value)}
              className="w-full bg-transparent outline-none text-black transition-all duration-200 border-b border-transparent focus:border-gray-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
