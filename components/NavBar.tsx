"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import clsx from "clsx";
import { useSelector } from "react-redux";

function NavBar() {
  const pathname = usePathname();
  const params = useParams();

  const id = params?.id; // Dynamic PRD ID from URL

  // Redux state
  const version = useSelector((state: any) => state.version.versionHistory);
  const quickLinks = useSelector((state: any) => state.quickLinks);
  const editor = useSelector((state: any) => state.editor.descriptions);
  const stakeholders = useSelector((state: any) => state.stakeholders);

  const navItems = [
    {
      label: "Version History",
      path: "versionHistory",
      isEmpty: version.length === 0,
    },
    {
      label: "Quick Links",
      path: "QuickLinks",
      isEmpty: quickLinks.every(
        (item) => !item.link.trim() || !item.name.trim()
      ),
    },
    {
      label: "Introduction",
      path: "Introduction",
      isEmpty: true,
    },
    {
      label: "Description Of Work",
      path: "descriptionofwork",
      isEmpty: editor.length === 0,
    },
    {
      label: "Stakeholder",
      path: "StakeHolder",
      isEmpty: stakeholders.every((item) => !item.role || !item.name),
    },
    {
      label: "Analytics",
      path: "Analytics",
      isEmpty: true, // backend not ready
    },
    {
      label: "UI / UX Mocks",
      path: "UIUXMocks",
      isEmpty: true, // backend not ready
    },
  ];

  // If ID is not available yet, don't render the nav
  if (!id) return null;

  return (
    <nav className="bg-gray-800 text-white dark:bg-gray-700">
      <div className="max-w-screen-xl px-4 py-3 mx-auto">
        <div className="flex items-center justify-between">
          <ul className="flex flex-row font-medium mt-0 space-x-4 text-sm">
            {navItems.map((item) => {
              const href = `/PRD/${id}/${item.path}`;
              const labelWithStar = item.isEmpty
                ? `${item.label} *`
                : item.label;

              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={clsx(
                      "px-3 py-1 rounded-md",
                      pathname === href
                        ? "bg-amber-50 text-black"
                        : "hover:bg-gray-600"
                    )}
                  >
                    {labelWithStar}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
