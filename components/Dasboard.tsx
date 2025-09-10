"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Edit } from "lucide-react";
import { trackEvent } from "@/lib/tracker";

export default function PRDDashboard() {
  type Card = {
    id: string;
    title: string;
    status: string;
    createdAt: string;
  };

  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // Modal refs
  const createRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);

  // Fetch cards on mount
  useEffect(() => {
    async function fetchCards() {
      setLoading(true);
      setError(null);
      try {
        const username = localStorage.getItem("loggedInUser");
        const res = await fetch(`/api/prd?username=${username}`);
        if (!res.ok) throw new Error("Failed to fetch cards");
        const data = await res.json();
        setCards(data);
      } catch (err) {
        setError(err.message);
        setCards([]);
      }
      setLoading(false);
    }
    fetchCards();
  }, []);

  // Close modals on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        showCreateModal &&
        createRef.current &&
        !createRef.current.contains(e.target)
      ) {
        setShowCreateModal(false);
      }
      if (
        showEditModal &&
        editRef.current &&
        !editRef.current.contains(e.target)
      ) {
        setShowEditModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCreateModal, showEditModal]);

  /** API helpers **/
  async function createCard(title) {
    const username = localStorage.getItem("loggedInUser");
    const res = await fetch("/api/prd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, status: "new", username }), // default
    });
    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(message || "Failed to create card");
    }
    const data = await res.json();
    trackEvent("createCard_response", { data });

    return data;
  }

  async function updateCardOnServer(id, updates) {
    const res = await fetch(`/api/prd/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(message || "Failed to update card");
    }
    const data = await res.json();
    trackEvent("editedCard_response", { data });
    return data;
  }

  /** Actions **/
  function openCreateModal() {
    setNewTitle("");
    setShowCreateModal(true);
    trackEvent("CLICK", { action: "openCreateModal" });
  }

  async function saveNewCard() {
    if (!newTitle.trim()) return;
    try {
      const response = await createCard(newTitle);
      const newCard = { ...response.card };
      setCards((prev) => [newCard, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      setError(error.message);
    }
  }

  function openEditModal(e, index) {
    e.stopPropagation();
    setEditIndex(index);
    setEditTitle(cards[index].title);
    setShowEditModal(true);
    trackEvent("CLICK", { action: "opend edit button" });
  }

  async function saveEditedCard() {
    if (editIndex === null) return;
    const updatedCards = [...cards];
    updatedCards[editIndex].title = editTitle;
    setCards(updatedCards);
    try {
      await updateCardOnServer(updatedCards[editIndex].id, {
        title: editTitle,
      });
      setShowEditModal(false);
    } catch (error) {
      setError(error.message);
    }
  }

  const goToPRD = (id) => {
    if (!id.trim()) return;
    trackEvent("Click", { action: "pusing inside the Prd" });
    router.push(`/PRD/${id}/versionHistory`);
  };

  async function handleStatusChange(id, newStatus) {
    const oldCards = [...cards];
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, status: newStatus } : card
      )
    );
    try {
      await updateCardOnServer(id, { status: newStatus });
    } catch (error) {
      setError(error.message);
      setCards(oldCards);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <>
      <div>
        <h1 className=" flex justify-between p-4 text-xl font-bold mb-6 text-black">
          Project Requirement Documents
          <Button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            + Create New
          </Button>
        </h1>
      </div>
      <div className="bg-white min-h-screen overflow-hidden relative">
        <div className="px-4 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div
              onClick={openCreateModal}
              className="flex flex-col items-center justify-center cursor-pointer rounded-xl border border-dashed border-gray-400 bg-white hover:bg-gray-100 transition p-6 shadow-sm hover:shadow-lg"
            >
              <div className="flex items-center justify-center w-16 h-16 mb-2 rounded-full border-2 border-gray-400 text-gray-600 text-5xl font-light">
                +
              </div>
              <span className="text-gray-700 text-sm font-medium">
                Create new PRD
              </span>
            </div>

            {/* Project cards */}
            {cards.map((card, index) => (
              <div
                key={card.id || index}
                className="relative p-6 rounded-xl bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
                onClick={() => goToPRD(card.id)}
              >
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => openEditModal(e, index)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Edit className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 flex items-center justify-center text-5xl">
                    👨‍💻
                  </div>
                  <h2 className="font-semibold text-lg  relative bottom-3">
                    {card.title}
                  </h2>
                </div>

                <div className="relative left-15 bottom-5.5">
                  <select
                    value={card.status || "new"}
                    onChange={(e) =>
                      handleStatusChange(card.id, e.target.value)
                    }
                    className={`appearance-none border-none outline-none text-xs font-medium rounded px-2 py-1 cursor-pointer
                  ${
                    card.status === "new"
                      ? "bg-gray-200 text-gray-700"
                      : card.status === "inprogress"
                      ? "bg-blue-200 text-blue-700"
                      : "bg-green-200 text-green-700"
                  }
                `}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="new" className="bg-gray-200 text-gray-700">
                      New
                    </option>
                    <option
                      value="inprogress"
                      className="bg-blue-200 text-blue-700"
                    >
                      In Progress
                    </option>
                    <option
                      value="done"
                      className="bg-green-200 text-green-700"
                    >
                      Done
                    </option>
                  </select>
                </div>

                <p className="text-gray-500 text-sm text-left mt-2">
                  {new Date(card.createdAt || Date.now()).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50">
            <div
              ref={createRef}
              className="bg-white rounded-lg shadow-lg w-80 p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter project title"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewCard}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50">
            <div
              ref={editRef}
              className="bg-white rounded-lg shadow-lg w-80 p-6"
            >
              <h2 className="text-lg font-semibold mb-4">Edit Project Title</h2>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedCard}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
