"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { trackEvent } from "@/lib/tracker";

interface RowCardProps {
  sNo: number;
  epicName: string;
  title: string;
  id: string;
  onClick: (id: string) => void;
  onEdit: (id: string, epicName: string, title: string) => void;
}

const RowCard: React.FC<RowCardProps> = ({
  sNo,
  epicName,
  title,
  id,
  onClick,
  onEdit,
}) => (
  <div className="flex items-center w-full min-h-[60px] bg-white rounded-md px-6 shadow-md mb-4 select-none transition-transform duration-100 hover:scale-[1.02] relative">
    <div className="w-12 font-bold text-lg text-[#334e68]">{sNo}</div>
    <div
      className="w-44 text-base font-normal text-gray-900 truncate pl-4"
      title={epicName}
    >
      {epicName}
    </div>
    <div
      className="flex-1 text-base text-gray-800 truncate pl-5 cursor-pointer"
      title={title}
      onClick={() => {
        trackEvent('CLICK', { action: 'rca_card_opened' });
        onClick(id);
      }}
    >
      {title}
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        trackEvent('CLICK', { action: 'rca_card_edit' });
        onEdit(id, epicName, title);
      }}
      className="absolute right-4 p-1 hover:bg-gray-100 rounded"
    >
      <svg
        className="w-5 h-5 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    </button>
  </div>
);

interface Card {
  _id: string;
  epicName: string;
  title: string;
}

const RootCauseAnalysis: React.FC = () => {
  const router = useRouter();  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newEpicName, setNewEpicName] = useState<string>("");
  const [newTitle, setNewTitle] = useState<string>("");

  useEffect(() => {
    async function fetchCards() {
      setLoading(true);
      trackEvent('CLICK', { action: 'rca_page_loaded' });
      
      try {
        const res = await fetch("/api/rcacards");
        if (res.ok) {
          const cardsData: Card[] = await res.json();
          setCards(cardsData);
          trackEvent('rca_cards_response', { data: cardsData });
        }
      } catch (err) {
        console.error("Error fetching cards:", err);
        trackEvent('RCA_CARDS_LOAD_ERROR', {
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
      setLoading(false);
    }
    fetchCards();
  }, []);

  const handleCreateClick = () => {
    trackEvent('CLICK', { action: 'rca_create_modal_open' });
    
    setEditMode(false);
    setNewEpicName("");
    setNewTitle("");
    setShowModal(true);
  };

  const handleEditClick = (id: string, epicName: string, title: string) => {
    trackEvent('CLICK', { action: 'rca_edit_modal_open' });
    
    setEditMode(true);
    setEditId(id);
    setNewEpicName(epicName);
    setNewTitle(title);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!newEpicName.trim() || !newTitle.trim()) {
      trackEvent('CLICK', { action: 'rca_save_validation_error' });
      alert("Epic Name and Title are required");
      return;
    }

    trackEvent('CLICK', { action: editMode ? 'rca_update_attempt' : 'rca_create_attempt' });

    try {
      if (editMode) {
        const res = await fetch(`/api/rcacards?id=${editId}`, {
          method: "PATCH",
          body: JSON.stringify({
            epicName: newEpicName.trim(),
            title: newTitle.trim(),
          }),
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          trackEvent('rca_update_response', { data: res.json() });
          
          setCards(
            cards.map((card) =>
              card._id === editId
                ? {
                    ...card,
                    epicName: newEpicName.trim(),
                    title: newTitle.trim(),
                  }
                : card
            )
          );
          setShowModal(false);
        } else {
          trackEvent('CLICK', { action: 'rca_update_error' });
          alert("Failed to update card");
        }
      } else {
        const res = await fetch("/api/rcacards", {
          method: "POST",
          body: JSON.stringify({
            epicName: newEpicName.trim(),
            title: newTitle.trim(),
          }),
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const newCard: Card = await res.json();
          trackEvent('rca_create_response', { data: newCard });
          
          setCards([newCard, ...cards]);
          setShowModal(false);
        } else {
          trackEvent('CLICK', { action: 'rca_create_error' });
          alert("Failed to create card");
        }
      }
    } catch (err) {
      trackEvent('CLICK', { action: 'rca_save_exception' });
      alert(editMode ? "Error updating card" : "Error creating card");
      console.error(err);
    }
  };

  const handleCardClick = (id: string) => {
    router.push(`/RCA/${id}`);
  };

  return (
    <div className="w-full px-10 pt-2 pb-10 box-border bg-white font-sans">
      <div className="flex justify-between items-center mb-1.5">
        <h1 className="text-3xl font-bold text-gray-900">
          Root Cause Analysis
        </h1>
        <Button
          onClick={handleCreateClick}
          className="flex items-center gap-2 bg-black text-white rounded-md px-5 py-2 font-normal text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          aria-label="Create new RCA card"
        >
          <span className="text-2xl leading-none">＋</span>
          Create
        </Button>
      </div>

      {loading && <p>Loading RCA cards...</p>}
      {!loading && cards.length === 0 && <p>No RCA cards found. Create one.</p>}
      {!loading &&
        cards.map((card: Card, i: number) => (
          <RowCard
            key={card._id}
            sNo={i + 1}
            epicName={card.epicName}
            title={card.title}
            id={card._id}
            onClick={handleCardClick}
            onEdit={handleEditClick}
          />
        ))}

      {showModal && (
        <div
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-[1000]"
          onClick={() => {
            trackEvent('CLICK', { action: 'rca_modal_cancel_overlay' });
            setShowModal(false);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <h2 className="text-xl font-normal mb-4">
              {editMode ? "Edit RCA Card" : "Create New RCA Card"}
            </h2>
            <input
              type="text"
              placeholder="Epic Name"
              value={newEpicName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewEpicName(e.target.value)
              }
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
              autoFocus
            />
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewTitle(e.target.value)
              }
              className="w-full border border-gray-300 rounded-md p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => {
                  trackEvent('CLICK', { action: 'rca_modal_cancel_button' });
                  setShowModal(false);
                }}
                className="px-4 py-2 rounded-md border border-gray-400 font-normal hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-black text-white font-normal hover:bg-gray-800"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RootCauseAnalysis;
