"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Save, Trash2 } from "lucide-react";
import { useEditorStore } from "@/store/useEditorStore";

type Entry = {
  _id: string;
  content: string;
  createdAt: string;
};

export default function WorkDesc() {
  const [savedEntries, setSavedEntries] = useState<Entry[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);

  const descriptionHTML = useEditorStore((state) => state.descriptionHTML);
  const setDescriptionHTML = useEditorStore(
    (state) => state.setDescriptionHTML
  );
  const editingId = useEditorStore((state) => state.editingId);
  const setEditingId = useEditorStore((state) => state.setEditingId);

  const userId = "fixed_user_id_for_description";

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch(`/api/description?userId=${userId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSavedEntries(data);
        } else if (data.data && Array.isArray(data.data)) {
          setSavedEntries(data.data);
        } else {
          console.error("Unexpected response format:", data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchEntries();
  }, []);

  useEffect(() => {
    if (editorRef.current && descriptionHTML !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = descriptionHTML || "";
    }
  }, [descriptionHTML]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && savedSelection.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
    }
  }, []);

  const executeCommand = (command: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }

    restoreSelection();

    if (command === "createLink") {
      const url = prompt("Enter URL:");
      if (url) {
        document.execCommand("createLink", false, url);
        const selection = window.getSelection();
        if (selection?.anchorNode?.parentElement?.tagName === "A") {
          const link = selection.anchorNode.parentElement;
          link.style.color = "#1d4ed8";
          link.style.textDecoration = "underline";
        }
      }
    } else {
      document.execCommand(command, false, null);
    }

    if (editorRef.current) {
      setDescriptionHTML(editorRef.current.innerHTML);
    }

    saveSelection();
  };

  const handleSave = async () => {
    const content = editorRef.current?.innerHTML.trim();
    if (!content) return alert("Editor content is empty.");

    if (editingId) {
      const res = await fetch(`/api/description/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, userId }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSavedEntries((prev) =>
          prev.map((e) => (e._id === data.data._id ? data.data : e))
        );
        alert("Updated successfully!");
      } else {
        alert("Failed to update.");
      }
    } else {
      const res = await fetch("/api/description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, userId }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSavedEntries((prev) => [data.data, ...prev]);
        alert("Saved successfully!");
      } else {
        alert("Failed to save.");
      }
    }

    setEditingId(null);
    setDescriptionHTML("");
    savedSelection.current = null;
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    const res = await fetch(`/api/description/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setSavedEntries((prev) => prev.filter((e) => e._id !== id));
      if (editingId === id) {
        setEditingId(null);
        setDescriptionHTML("");
        if (editorRef.current) editorRef.current.innerHTML = "";
      }
      alert("Deleted.");
    } else {
      alert("Failed to delete.");
    }
  };

  const handleEdit = (entry: Entry) => {
    setEditingId(entry._id);
    setDescriptionHTML(entry.content);
    if (editorRef.current) {
      editorRef.current.innerHTML = entry.content;
      editorRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-6 font-sans">
      <div className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700">Scope of Work</h1>
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {editingId ? "Update Document" : "Save Document"}
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 bg-gray-100 p-3 rounded-md border border-gray-300">
          <button onClick={() => executeCommand("bold")} title="Bold">
            <i className="fas fa-bold px-2 py-1 border rounded-md" />
          </button>
          <button onClick={() => executeCommand("italic")} title="Italic">
            <i className="fas fa-italic px-2 py-1 border rounded-md" />
          </button>
          <button onClick={() => executeCommand("underline")} title="Underline">
            <i className="fas fa-underline px-2 py-1 border rounded-md" />
          </button>
          <button
            onClick={() => executeCommand("createLink")}
            title="Insert Link"
          >
            <i className="fas fa-link px-2 py-1 border rounded-md" />
          </button>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onInput={() => {
            saveSelection();
            if (editorRef.current) {
              setDescriptionHTML(editorRef.current.innerHTML);
            }
          }}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          className="border border-gray-300 p-4 rounded-md min-h-[300px] bg-white text-gray-800 overflow-auto"
          style={{
            direction: "ltr", // ✅ Force LTR typing
            textAlign: "left", // ✅ Align text to left
            unicodeBidi: "plaintext", // ✅ Fix bidirectional typing behavior
          }}
        />
      </div>

      {/* Saved Entries */}
      <div className="w-full max-w-5xl mt-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Saved Descriptions
        </h2>
        {savedEntries.length === 0 ? (
          <p className="text-gray-500 italic">No saved entries.</p>
        ) : (
          <div className="max-h-[500px] overflow-y-auto pr-2">
            {savedEntries.map((entry) => (
              <div
                key={entry._id}
                className="bg-white border border-gray-300 rounded-md p-4 shadow-sm mb-4 relative"
              >
                <div
                  className="text-gray-800 break-words cursor-pointer"
                  onClick={() => handleEdit(entry)}
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                />
                <button
                  onClick={() => handleDelete(entry._id)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FontAwesome CDN */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        crossOrigin="anonymous"
      />
    </div>
  );
}
