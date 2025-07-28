"use client";
import React, { useEffect, useState } from "react";

export default function StackeHolders() {
  const [links, setLinks] = useState([
    { role: "", name: "" },
    { role: "", name: "" },
  ]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("quickLinks"));
    if (saved)
      setLinks([...saved, { role: "", name: "" }, { role: "", name: "" }]);
  }, []);

  useEffect(() => {
    const filled = links.filter((l) => l.role || l.name);
    localStorage.setItem("quickLinks", JSON.stringify(filled));
  }, [links]);

  const handleChange = (index, field, value) => {
    const updated = [...links];
    updated[index][field] = value;

    const cleaned = updated.filter((item) => item.role || item.name);
    while (
      cleaned.length < updated.length ||
      cleaned.slice(-2).filter((l) => l.role || l.name).length > 0
    ) {
      cleaned.push({ role: "", name: "" });
    }

    setLinks(cleaned);
  };

  const handleBlur = () => {
    const filtered = links.filter(
      (item, index) => item.role || item.name || index >= links.length - 2
    );
    setLinks(filtered);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h2 className="text-2xl font-semibold mb-6">Stakeholder</h2>

      {/* Header Row */}
      <div className="grid grid-cols-2 gap-4 pb-2 border-b font-semibold text-gray-700">
        <div>Role</div>
        <div>Name</div>
      </div>

      {/* Input Rows */}
      <div className="space-y-1 mt-2">
        {links.map((item, idx) => (
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
