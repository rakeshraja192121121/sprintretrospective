"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";

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
  Link,
  Table,
} from "lucide-react";

type Entry = {
  _id: string;
  content: string;
  createdAt: string;
};

export default function WorkDesc() {
  const descriptions = useSelector((state: any) => state.editor.descriptions);
  const editingId = useSelector((state: any) => state.editor.editingId);
  const draftContent = useSelector((state: any) => state.editor.draftContent);
  // const [tableData, setTableData] = useState(["", "", "", ""]);
  // const [savedTables, setSavedTables] = useState<string[][]>([]);

  const dispatch = useDispatch();
  const router = useRouter();

  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);

  const userId = "fixed_user_id";

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

  const insertGridTable = () => {
    const colsStr = prompt("Enter number of columns (max 10):", "3");
    if (!colsStr) return;
    const cols = Math.min(Math.max(Number(colsStr), 1), 10);
    if (isNaN(cols)) {
      alert("Please enter a valid number for columns.");
      return;
    }
    const rowsStr = prompt(
      "Enter number of rows (including header, max 10):",
      "3"
    );
    if (!rowsStr) return;
    const rows = Math.min(Math.max(Number(rowsStr), 1), 10);
    if (isNaN(rows)) {
      alert("Please enter a valid number for rows.");
      return;
    }

    let html = `<div class="table-grid" data-cols="${cols}" data-rows="${rows}" style="display:grid; grid-template-columns: repeat(${cols}, 1fr);">`;

    // Header cells
    for (let c = 0; c < cols; c++) {
      html += `<div contenteditable="true" class="cell cell-header" style="border: 1px solid #ccc;" tabindex="0">&nbsp;</div>`;
    }
    // Body cells
    for (let r = 1; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        html += `<div contenteditable="true" style="border: 1px solid #ccc;" class="cell" tabindex="0">&nbsp;</div>`;
      }
    }
    html += `</div><br/>`;

    insertHtmlAtCursor(html, ".table-grid .cell:not(.cell-header)");

    //   const html = `<div class="grid grid-cols-${colsStr} gap-2 mt-4 mb-4">
    //   <div class="bg-gray-50 border border-gray-300">
    //     <input class="text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
    //   </div>
    //   <div class="bg-gray-50 border border-gray-300">
    //     <input class="text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
    //   </div>
    //   <div class="bg-gray-50 border border-gray-300">
    //     <input class="text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
    //   </div>
    //   <div class="bg-gray-50 border border-gray-300">
    //     <input class="text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
    //   </div>
    // </div>
    // <br/>`;
    //   insertHtmlAtCursor(html);
  };

  const executeCommand = (command: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    restoreSelection();

    if (command === "createLink") {
      const url = prompt("Enter URL:");
      if (url) {
        document.execCommand(command, false, url);
        const sel = window.getSelection();
        if (sel?.anchorNode?.parentElement?.tagName === "A") {
          const link = sel.anchorNode?.parentElement as HTMLElement;
          link.style.color = "#2563eb";
          link.style.textDecoration = "underline";
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noopener noreferrer");
        }
      }
    } else {
      document.execCommand(command, false, null);
    }

    if (editorRef.current) {
      dispatch(setDraftContent(editorRef.current.innerHTML));
    }
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
          if (
            currentNode &&
            currentNode.classList &&
            currentNode.classList.contains("cell")
          ) {
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
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Scope of Work</h1>
          <button className="btn-primary" onClick={handleSave}>
            <Save className="inline-block mr-2" />
            {editingId ? "Update Document" : "Save Document"}
          </button>
        </header>

        <nav className="flex gap-2 mb-3">
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
            onClick={() => executeCommand("createLink")}
            className="btn-outline"
            aria-label="Insert Link"
            type="button"
          >
            <Link className="w-5 h-5" />
          </button>
          <button
            onClick={insertGridTable}
            className="btn-outline"
            aria-label="Insert Table"
            type="button"
          >
            <Table className="w-5 h-5" />
          </button>
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

        /* Ensure table grid and cells inside both editor and saved content have correct style */
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
