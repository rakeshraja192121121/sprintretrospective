"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

export default function TabNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // Define tabs with unique paths
  const tabs = [
    { label: "Projects", path: "/project" },
    { label: "PRD", path: "/PRD" },
    { label: "Retrospection", path: "/sprint-retro-board" },
    { label: "RCA", path: "/RCA" },
  ];

  return (
    <nav className="flex gap-2 p-2 ml-3  rounded-md bg-white">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.path);
        return (
          <button
            key={tab.path} // stable unique key
            onClick={() => router.push(tab.path)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-800 text-white"
                : "bg-gray-100 hover:bg-blue-100 text-gray-800"
            }`}
            aria-current={isActive ? "page" : undefined}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
