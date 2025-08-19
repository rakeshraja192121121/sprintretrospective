"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

type CustomPage = {
  label: string;
  path: string;
};

function NavBar() {
  const pathname = usePathname();
  const params = useParams();
  const id = params?.id;

  interface VersionEntry {
    _id: string;
    date: string;
    name: string;
    update: string;
  }

  interface VersionState {
    versionHistory: VersionEntry[];
    editingId: string | null; // if you want to track which entry is being edited
    draftEntry: Partial<VersionEntry>; // for live input of new or edited entry
  }

  type QuickLinkItem = {
    name: string;
    link: string;
  };
  interface DescriptionEntry {
    _id: string; // Assuming each description has an _id
    // Add other properties that a description might have
    // if the code cose any post error it may coz of this conetnt is mising
  }

  interface EditorState {
    descriptions: DescriptionEntry[];
    editingId: string | null;
    draftContent: string;
  }
  type Stakeholder = {
    role: string;
    name: string;
  };

  const version = useSelector(
    (state: { version: VersionState }) => state.version?.versionHistory ?? []
  );
  const quickLinks = useSelector(
    (state: { quickLinks: QuickLinkItem[] }) => state.quickLinks ?? []
  );
  const editor = useSelector(
    (state: { editor: EditorState }) => state.editor?.descriptions ?? []
  );
  const stakeholders = useSelector(
    (state: { stakeholders: Stakeholder[] }) => state.stakeholders ?? []
  );

  // Local state for fetched custom pages with type
  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");

  // Fetch dynamic pages from MongoDB on mount, only if id exists
  useEffect(() => {
    if (!id) return;
    fetch(`/api/tabs?projectId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        // Assuming data is { success: true, data: [...] }
        if (data.success && Array.isArray(data.data)) {
          setCustomPages(data.data);
        } else {
          setCustomPages([]);
        }
      })
      .catch((err) => console.error("Error fetching tabs:", err));
  }, [id]);

  const navItems = [
    {
      label: "Version History",
      path: "versionHistory",
      isEmpty: version.length === 0,
    },
    {
      label: "Quick Links",
      path: "QuickLinks",
      isEmpty:
        quickLinks.length === 0 ||
        quickLinks.every((item) => !item.link?.trim() || !item.name?.trim()),
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
      isEmpty:
        stakeholders.length === 0 ||
        stakeholders.every((item) => !item.role || !item.name),
    },
    {
      label: "Analytics",
      path: "Analytics",
      isEmpty: true,
    },
    {
      label: "UI / UX Mocks",
      path: "UIUXMocks",
      isEmpty: true,
    },
    // Spread dynamic custom pages from API
    ...customPages.map((page) => ({
      label: page.label,
      path: page.path,
      isEmpty: false,
    })),
  ];

  if (!id) return null;

  const handleAddPage = async () => {
    if (!newPageTitle.trim()) return;
    const slug = newPageTitle.replace(/\s+/g, "_");

    try {
      const res = await fetch("/api/tabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newPageTitle,
          path: slug,
          projectId: id,
        }),
      });

      if (res.ok) {
        const responseData = await res.json();
        // Assuming responseData contains { success: true, data: savedPage }
        if (responseData.success && responseData.data) {
          setCustomPages((prev) => [...prev, responseData.data]);
          setShowModal(false);
          setNewPageTitle("");
        } else {
          console.error("Failed to add page: invalid response");
        }
      } else {
        console.error("Failed to add page: HTTP error", res.status);
      }
    } catch (err) {
      console.error("Error adding page:", err);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
      <div className="bg-white text-black p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">Create New Page</h2>
        <input
          type="text"
          value={newPageTitle}
          onChange={(e) => setNewPageTitle(e.target.value)}
          placeholder="Enter page title"
          className="border p-2 w-full mb-4"
          autoFocus
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowModal(false)}
            className="bg-gray-300 px-4 py-1 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleAddPage}
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
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
                      className={
                        "px-3 py-1 rounded-md " +
                        (pathname === href
                          ? "bg-amber-50 text-black"
                          : "hover:bg-gray-600")
                      }
                    >
                      {labelWithStar}
                    </Link>
                  </li>
                );
              })}

              {/* Plus Button */}
              <li>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-2 bg-white text-black rounded-md hover:bg-amber-50"
                  aria-label="Add new page"
                  type="button"
                >
                  +
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div>{showModal && modalContent}</div>
    </>
  );
}

export default NavBar;
