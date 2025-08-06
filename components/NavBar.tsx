"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useSelector } from "react-redux";

function NavBar() {
  const pathname = usePathname();

  // Redux state
  const version = useSelector((state: any) => state.version.versionHistory);
  const quickLinks = useSelector((state: any) => state.quickLinks);
  const editor = useSelector((state: any) => state.editor.descriptions);
  const stakeholders = useSelector((state: any) => state.stakeholders);

  const navItems = [
    {
      label: "Version History",
      href: "/PRD/versionHistory",
      isEmpty: version.length === 0,
    },
    {
      label: "Quick Links",
      href: "/PRD/QuickLinks",
      isEmpty: quickLinks.every(
        (item) => !item.link.trim() || !item.name.trim()
      ),
    },
    {
      label: "Introduction",
      href: "/PRD/Introduction",
      isEmpty: true,
    },
    {
      label: "Description Of Work",
      href: "/PRD/descriptionofwork",
      isEmpty: editor.length === 0,
    },
    {
      label: "Stakeholder",
      href: "/PRD/StakeHolder",
      isEmpty: stakeholders.every((item) => !item.role || !item.name),
    },
    {
      label: "Analytics",
      href: "/PRD/Analytics",
      isEmpty: true, // backend not ready
    },
    {
      label: "UI / UX Mocks",
      href: "/PRD/UIUXMocks",
      isEmpty: true, // backend not ready
    },
  ];

  return (
    <nav className="bg-gray-800 text-white dark:bg-gray-700">
      <div className="max-w-screen-xl px-4 py-3 mx-auto">
        <div className="flex items-center justify-between">
          <ul className="flex flex-row font-medium mt-0 space-x-4 text-sm">
            {navItems.map((item) => {
              const borderColor = item.isEmpty
                ? "border-t-4 border-red-500"
                : "border-t-4 border-green-500";

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "px-3 py-1 rounded-md",
                      borderColor,
                      pathname === item.href
                        ? "bg-amber-50 text-black"
                        : "hover:bg-gray-600"
                    )}
                  >
                    {item.label}
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
