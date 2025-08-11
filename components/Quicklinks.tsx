"use client";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setLinks } from "../store/quicklinkSlice";

export default function QuickLinks() {
  const links = useSelector((state) => state.quickLinks);
  const dispatch = useDispatch();

  // Initialize from localStorage or fallback to default empty links on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("quickLinks"));
    if (saved && saved.length > 0) {
      dispatch(
        setLinks([...saved, { name: "", link: "" }, { name: "", link: "" }])
      );
    } else {
      dispatch(
        setLinks([
          { name: "", link: "" },
          { name: "", link: "" },
        ])
      );
    }
  }, [dispatch]);

  // Save updated links to localStorage whenever links in Redux change
  useEffect(() => {
    const filled = links.filter((l) => l.name || l.link);
    localStorage.setItem("quickLinks", JSON.stringify(filled));
  }, [links]);

  // This function updates a field in a particular link and keeps empty slots intact
  const handleChange = (index, field, value) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };

    const cleaned = updated.filter((item) => item.name || item.link);
    while (
      cleaned.length < updated.length ||
      cleaned.slice(-2).filter((l) => l.name || l.link).length > 0
    ) {
      cleaned.push({ name: "", link: "" });
    }

    dispatch(setLinks(cleaned));
  };

  // Optional: onBlur cleaning similarly ensures trailing empty rows
  const handleBlur = () => {
    const filtered = links.filter(
      (item, index) => item.name || item.link || index >= links.length - 2
    );
    dispatch(setLinks(filtered));
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>

      {/* Header Row */}
      <div className="flex gap-2 pb-2 border-b font-semibold text-gray-700">
        <div className="w-1/4">Name</div>
        <div className="flex-1">Link</div>
      </div>

      {/* Input Rows */}
      <div className="space-y-1 mt-2">
        {links.map((item, idx) => (
          <div
            key={idx}
            className="flex gap-2 border-b border-gray-300 py-2 hover:bg-gray-50 focus-within:bg-gray-50 transition-all duration-300"
            onBlur={handleBlur}
          >
            <input
              type="text"
              value={item.name}
              placeholder="Name"
              onChange={(e) => handleChange(idx, "name", e.target.value)}
              className="w-1/4 bg-transparent outline-none text-black transition-all duration-200 border-b border-transparent focus:border-gray-400"
            />
            <input
              type="text"
              value={item.link}
              placeholder="Link"
              onChange={(e) => handleChange(idx, "link", e.target.value)}
              className="flex-1 bg-transparent outline-none text-blue-600 transition-all duration-200 border-b border-transparent focus:border-gray-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
