import React from "react";
import Link from "next/link";

function NavBar() {
  const handleSaveAll = () => {
    // You can replace this with actual save logic or call a context function
    alert("All changes saved successfully!");
  };

  return (
    <nav className="bg-gray-800 text-white dark:bg-gray-700">
      <div className="max-w-screen-xl px-4 py-3 mx-auto">
        <div className="flex items-center justify-between">
          <ul className="flex flex-row font-medium mt-0 space-x-8 rtl:space-x-reverse text-sm">
            <li>
              <Link href="/PRD/versionHistory">Version History</Link>
            </li>
            <li>
              <Link href="/PRD/QuickLinks">Quick Links</Link>
            </li>
            <li>
              <Link href="/PRD/Introduction">Introduction</Link>
            </li>
            <li>
              <Link href="/PRD/descriptionofwork">Description Of Work</Link>
            </li>
            <li>
              <Link href="/PRD/StakeHolder">Stakeholder</Link>
            </li>
            <li>
              <Link href="/PRD/Analytics" className="hover:underline">
                Analytics
              </Link>
            </li>
            <li>
              <Link href="/PRD/UIUXMocks" className="hover:underline">
                UI / UX Mocks
              </Link>
            </li>
            <li>
              <Link href="/PRD">ViewDocument</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
