"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import {
  setDescriptions,
  addDescription,
  updateDescription,
  removeDescription,
  setEditingId,
  setDraftContent,
} from "@/store/editorSlice";

import {
  Save,
  Trash2,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  Table as TableIcon,
} from "lucide-react";

function Popover({
  visible,
  children,
  onClose,
  anchorRef,
}: {
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose, anchorRef]);

  if (!visible) return null;

  return (
    <div
      ref={popoverRef}
      style={{
        position: "absolute",
        zIndex: 1000,
        bottom: "calc(100% + 8px)",
        left: 0,
        backgroundColor: "white",
        padding: 12,
        border: "1px solid #ccc",
        borderRadius: 8,
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
        minWidth: 220,
      }}
    >
      {children}
    </div>
  );
}

type Entry = {
  _id: string;
  content: string;
  createdAt: string;
};

export default function WorkDesc() {
  interface DescriptionEntry {
    _id: string; // Assuming each description has an _id
    // Add other properties that a description might have
    // e.g. content: string;
  }

  interface EditorState {
    descriptions: DescriptionEntry[];
    editingId: string | null;
    draftContent: string;
  }
  const descriptions = useSelector(
    (state: { editor: EditorState }) => state.editor.descriptions
  );
  const editingId = useSelector(
    (state: { editor: EditorState }) => state.editor.editingId
  );
  const draftContent = useSelector(
    (state: { editor: EditorState }) => state.editor.draftContent
  );

  const dispatch = useDispatch();
  const router = useRouter();

  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);

  const userId = "fixed_user_id";

  // Popover states & refs
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [tablePopoverOpen, setTablePopoverOpen] = useState(false);

  const linkBtnRef = useRef<HTMLButtonElement>(null);
  const tableBtnRef = useRef<HTMLButtonElement>(null);

  const [linkUrl, setLinkUrl] = useState("");
  const [tableRows, setTableRows] = useState("3");
  const [tableCols, setTableCols] = useState("3");

  useEffect(() => {
    const fetchDescriptions = async () => {
      try {
        const res = await fetch("/api/description");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          dispatch(setDescriptions(data.data));
        }
      } catch (e) {
        console.error("Error fetching descriptions:", e);
      }
    };
    fetchDescriptions();
  }, [dispatch]);

  useEffect(() => {
    if (!editingId) {
      const saved = localStorage.getItem("draftContent");
      if (saved !== null && saved !== draftContent) {
        dispatch(setDraftContent(saved));
      } else if (saved === null && draftContent !== "") {
        dispatch(setDraftContent(""));
      }
    } else {
      if (localStorage.getItem("draftContent") !== null) {
        localStorage.removeItem("draftContent");
      }
      if (draftContent !== "") {
        dispatch(setDraftContent(""));
      }
    }
  }, [dispatch, editingId]);

  useEffect(() => {
    if (draftContent) {
      localStorage.setItem("draftContent", draftContent);
    } else if (localStorage.getItem("draftContent") !== null) {
      localStorage.removeItem("draftContent");
    }
  }, [draftContent]);

  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== draftContent) {
        const sel = window.getSelection();
        const prevRange = sel?.rangeCount
          ? sel.getRangeAt(0).cloneRange()
          : null;

        editorRef.current.innerHTML = draftContent || "";

        if (
          prevRange &&
          editorRef.current.contains(prevRange.startContainer) &&
          editorRef.current.contains(prevRange.endContainer)
        ) {
          try {
            sel?.removeAllRanges();
            sel?.addRange(prevRange);
          } catch {
            placeCursorAtEnd(editorRef.current);
          }
        } else if (editorRef.current.innerHTML) {
          placeCursorAtEnd(editorRef.current);
        }
      }
    }
  }, [draftContent]);

  useEffect(() => {
    const currentDoc = descriptions.find((doc: Entry) => doc._id === editingId);
    const newContent = editingId ? currentDoc?.content ?? "" : "";
    if (newContent !== draftContent) {
      dispatch(setDraftContent(newContent));
    }
  }, [editingId, descriptions, dispatch]);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
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

  const placeCursorAtEnd = (el: HTMLElement) => {
    const range = document.createRange();
    const sel = window.getSelection();
    if (sel) {
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      el.focus();
    }
  };

  const insertHtmlAtCursor = (html: string, focusSelector?: string) => {
    restoreSelection(); // Ensure selection restored before inserting

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      if (editorRef.current) {
        editorRef.current.innerHTML += html;
        dispatch(setDraftContent(editorRef.current.innerHTML));
      }
      return;
    }

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const el = document.createElement("div");
    el.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node;
    while ((node = el.firstChild)) {
      frag.appendChild(node);
    }
    range.insertNode(frag);

    if (focusSelector && editorRef.current) {
      const target = editorRef.current.querySelector(focusSelector);
      if (target instanceof HTMLElement) {
        placeCursorAtEnd(target);
        target.focus();
      }
    }

    if (editorRef.current) {
      dispatch(setDraftContent(editorRef.current.innerHTML));
    }
    saveSelection();
  };

  const insertLink = () => {
    if (!linkUrl) {
      alert("Please enter a URL.");
      return;
    }
    restoreSelection();
    document.execCommand("createLink", false, linkUrl);
    const sel = window.getSelection();
    if (sel?.anchorNode?.parentElement?.tagName === "A") {
      const link = sel.anchorNode.parentElement;
      link.style.color = "#2563eb";
      link.style.textDecoration = "underline";
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
    dispatch(setDraftContent(editorRef.current?.innerHTML || ""));
    setLinkPopoverOpen(false);
    setLinkUrl("");
  };

  const insertGridTable = () => {
    const cols = Math.min(Math.max(Number(tableCols), 1), 10);
    const rows = Math.min(Math.max(Number(tableRows), 1), 10);

    if (isNaN(cols) || isNaN(rows)) {
      alert("Please enter valid numbers for rows and columns.");
      return;
    }

    let html = `<div class="table-grid" data-cols="${cols}" data-rows="${rows}" style="display:grid; grid-template-columns: repeat(${cols}, 1fr);">`;

    for (let c = 0; c < cols; c++) {
      html += `<div contenteditable="true" class="cell cell-header" style="border: 1px solid #ccc;" tabindex="0">&nbsp;</div>`;
    }
    for (let r = 1; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        html += `<div contenteditable="true" style="border: 1px solid #ccc;" class="cell" tabindex="0">&nbsp;</div>`;
      }
    }
    html += `</div><br/>`;

    // Restore selection before inserting the table to fix focus issue
    restoreSelection();

    insertHtmlAtCursor(html, ".table-grid .cell:not(.cell-header)");

    setTablePopoverOpen(false);
    setTableCols("3");
    setTableRows("3");
  };

  const executeCommand = (command: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === "createLink") {
      saveSelection();
      setLinkPopoverOpen(true);
      setTablePopoverOpen(false);
      return;
    }

    if (command === "insertTable") {
      saveSelection();
      setTablePopoverOpen(true);
      setLinkPopoverOpen(false);
      return;
    }

    document.execCommand(command, false, null);
    dispatch(setDraftContent(editorRef.current.innerHTML));
    saveSelection();
  };

  const handleSave = async () => {
    const content = draftContent.trim();
    if (!content) {
      alert("Cannot save empty content.");
      return;
    }
    try {
      if (editingId) {
        const res = await fetch(`/api/description/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, userId }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          dispatch(updateDescription(data.data));
          alert("Updated successfully");
        } else {
          alert("Failed to update");
        }
      } else {
        const res = await fetch(`/api/description`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, userId }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          dispatch(addDescription(data.data));
          alert("Saved successfully");
        } else {
          alert("Failed to save");
        }
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while saving");
    } finally {
      dispatch(setDraftContent(""));
      dispatch(setEditingId(null));
      savedSelection.current = null;
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
      localStorage.removeItem("draftContent");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`/api/description/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        dispatch(removeDescription(id));
        if (id === editingId) {
          dispatch(setEditingId(null));
          dispatch(setDraftContent(""));
          if (editorRef.current) editorRef.current.innerHTML = "";
          localStorage.removeItem("draftContent");
        }
        alert("Deleted successfully");
      } else {
        alert("Failed to delete");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while deleting");
    }
  };

  const handleEdit = (entry: Entry) => {
    dispatch(setEditingId(entry._id));
    dispatch(setDraftContent(entry.content));
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const onDescriptionClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A") {
      const href = target.getAttribute("href");
      if (href && href.startsWith("/")) {
        e.preventDefault();
        router.push(href);
      }
    }
  };

  const handleEditorKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Tab") {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && editorRef.current) {
          const range = selection.getRangeAt(0);
          let currentNode = range.startContainer as HTMLElement;
          while (currentNode && !currentNode.classList?.contains?.("cell")) {
            currentNode = currentNode.parentElement as HTMLElement;
          }
          if (currentNode && currentNode.classList?.contains("cell")) {
            event.preventDefault();
            const nextCell =
              currentNode.nextElementSibling as HTMLElement | null;
            if (nextCell && nextCell.classList.contains("cell")) {
              placeCursorAtEnd(nextCell);
              nextCell.focus();
            }
          }
        }
      }
    },
    []
  );

  return (
    <>
      <div className="container mx-auto py-12 px-4 max-w-5xl relative">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Scope of Work</h1>
          <button className="btn-primary" onClick={handleSave}>
            <Save className="inline-block mr-2" />
            {editingId ? "Update Document" : "Save Document"}
          </button>
        </header>

        <nav className="flex gap-2 mb-3 relative">
          <button
            onClick={() => executeCommand("bold")}
            className="btn-outline"
            aria-label="Bold"
            type="button"
          >
            <Bold className="w-5 h-5" />
          </button>
          <button
            onClick={() => executeCommand("italic")}
            className="btn-outline italic"
            aria-label="Italic"
            type="button"
          >
            <Italic className="w-5 h-5" />
          </button>
          <button
            onClick={() => executeCommand("underline")}
            className="btn-outline underline"
            aria-label="Underline"
            type="button"
          >
            <Underline className="w-5 h-5" />
          </button>

          <button
            ref={linkBtnRef}
            onClick={() => executeCommand("createLink")}
            className="btn-outline"
            aria-label="Insert Link"
            type="button"
          >
            <LinkIcon className="w-5 h-5" />
          </button>
          <Popover
            visible={linkPopoverOpen}
            onClose={() => setLinkPopoverOpen(false)}
            anchorRef={linkBtnRef}
          >
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Enter URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="border p-1 rounded"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    insertLink();
                  }
                }}
                autoFocus
              />
              <button
                className="btn-primary"
                type="button"
                onClick={insertLink}
              >
                Insert Link
              </button>
            </div>
          </Popover>

          <button
            ref={tableBtnRef}
            onClick={() => executeCommand("insertTable")}
            className="btn-outline"
            aria-label="Insert Table"
            type="button"
          >
            <TableIcon className="w-5 h-5" />
          </button>
          <Popover
            visible={tablePopoverOpen}
            onClose={() => setTablePopoverOpen(false)}
            anchorRef={tableBtnRef}
          >
            <div className="flex flex-col gap-2">
              <input
                type="number"
                min={1}
                max={10}
                placeholder="Rows (1-10)"
                value={tableRows}
                onChange={(e) => setTableRows(e.target.value)}
                className="border p-1 rounded"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    insertGridTable();
                  }
                }}
                autoFocus
              />
              <input
                type="number"
                min={1}
                max={10}
                placeholder="Columns (1-10)"
                value={tableCols}
                onChange={(e) => setTableCols(e.target.value)}
                className="border p-1 rounded"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    insertGridTable();
                  }
                }}
              />
              <button
                className="btn-primary"
                type="button"
                onClick={insertGridTable}
              >
                Insert Table
              </button>
            </div>
          </Popover>
        </nav>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          className="border border-gray-300 p-4 rounded-md min-h-[300px] overflow-auto bg-white"
          onInput={() => {
            if (!editorRef.current) return;
            dispatch(setDraftContent(editorRef.current.innerHTML));
            saveSelection();
          }}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          onKeyDown={handleEditorKeyDown}
          aria-label="Rich text editor"
          style={{ whiteSpace: "normal" }}
        />

        <section className="mt-8">
          <h2 className="font-semibold mb-3">Saved Documents</h2>
          {descriptions.length === 0 && !draftContent.trim() && (
            <p className="text-sm italic text-gray-500">No saved documents.</p>
          )}
          <div className="space-y-4 max-h-96 overflow-y-auto overflow-x-auto pb-2">
            {descriptions.map((desc: Entry) => {
              const containsTable = desc.content.includes('class="table-grid"');
              return (
                <article
                  key={desc._id}
                  className="border p-4 rounded shadow relative group bg-white cursor-pointer"
                >
                  <div
                    onClick={() => handleEdit(desc)}
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    tabIndex={0}
                    role="button"
                    aria-label="Edit Document"
                    dangerouslySetInnerHTML={{ __html: desc.content }}
                    onClickCapture={onDescriptionClick}
                    suppressContentEditableWarning
                    className={containsTable ? "saved-content-display" : ""}
                  />
                  <button
                    className="hidden group-hover:block absolute top-2 right-2 text-red-600 hover:text-red-900"
                    onClick={() => handleDelete(desc._id)}
                    aria-label="Delete Document"
                    type="button"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </article>
              );
            })}
            {draftContent.trim() && !editingId && (
              <article className="border p-4 rounded bg-yellow-50 text-yellow-800 italic">
                <h3>Unsaved Document (Draft)</h3>
                <div
                  dangerouslySetInnerHTML={{ __html: draftContent }}
                  className="saved-content-display"
                />
              </article>
            )}
          </div>
        </section>
      </div>

      <style jsx global>{`
        .btn-primary {
          display: inline-flex;
          align-items: center;
          background-color: #2563eb;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          cursor: pointer;
          background: white;
          user-select: none;
          transition: background-color 0.2s;
        }
        .btn-outline:hover {
          background-color: #e5e7eb;
        }
        .italic {
          font-style: italic;
        }
        .underline {
          text-decoration: underline;
        }
        .space-y-4.overflow-y-auto.overflow-x-auto {
          padding-bottom: 10px;
        }
        [contenteditable] .table-grid,
        .saved-content-display .table-grid {
          display: grid;
          border: 2.5px solid black !important;
          border-radius: 8px;
          box-shadow: 0 2px 8px #00000022;
          background: #f2f8ff;
          margin-top: 1rem;
          margin-bottom: 1rem;
          width: max-content;
          min-width: 350px;
          max-width: 100%;
          overflow: visible !important;
          grid-gap: 0;
          box-sizing: border-box;
        }
        [contenteditable] .cell,
        .saved-content-display .cell {
          min-width: 120px;
          min-height: 48px;
          border: 1.5px solid black !important;
          font-size: 16px;
          padding: 12px;
          background: #fff;
          overflow-wrap: break-word;
          word-break: break-word;
          transition: background 0.11s, outline 0.12s;
          outline: none;
          cursor: text;
          box-sizing: border-box;
        }
        [contenteditable] .cell-header,
        .saved-content-display .cell-header {
          background: #deedfa;
          font-weight: bold;
          min-height: 60px;
          border-bottom: 2px solid black !important;
        }
        [contenteditable] .cell:focus,
        [contenteditable] .cell:hover {
          background: #edf4ff;
          outline: 2px solid black;
          z-index: 3;
        }
        [contenteditable] [contenteditable="true"]:focus {
          outline: none !important;
        }
      `}</style>
    </>
  );
}
