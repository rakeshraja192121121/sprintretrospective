"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "./ui/button";
import { useParams } from "next/navigation";
import { trackEvent } from "@/lib/tracker";

const sections = [
  "What happened",
  "Impact",
  "Timeline",
  "Root Cause",
  "Next Steps",
  "Attendees",
];

const sectionToField = {
  "What happened": "whatHappened",
  Impact: "impact",
  Timeline: "timeline",
  "Root Cause": "rootCause",
  "Next Steps": "nextSteps",
  Attendees: "attendees",
};

export default function RcaToggleEdit() {
  const params = useParams();
  const cardID = params?.id;
  const [editMode, setEditMode] = useState(false);
  const [content, setContent] = useState(() =>
    sections.reduce((acc, section) => ({ ...acc, [section]: "" }), {})
  );
  const [loading, setLoading] = useState(false);
  const editorRefs = useRef({});

  const loadData = useCallback(async () => {
    if (!cardID) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/rcaConetent?cardID=${cardID}`);
      if (response.ok) {
        const data = await response.json();
        trackEvent('CLICK', { action: 'rca_content_loaded' });
        if (data && Object.keys(data).length > 0) {
          const newContent = {};
          sections.forEach((section) => {
            const field = sectionToField[section];
            newContent[section] = data[field] || "";
          });
          setContent(newContent);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [cardID]);

  const saveData = useCallback(async () => {
    if (!cardID) return;
    try {
      const saveContent = {};
      sections.forEach((section) => {
        const field = sectionToField[section];
        saveContent[field] = content[section] || "";
      });

      trackEvent('CLICK', { action: 'rca_content_saved' });
      await fetch("/api/rcaConetent", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardID, ...saveContent }),
      });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [cardID, content]);

  useEffect(() => {
    loadData();
  }, [cardID, loadData]);

  useEffect(() => {
    if (!cardID) return;
    const timer = setTimeout(() => {
      if (Object.values(content).some((val) => val)) {
        saveData();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, cardID, saveData]);

  const handleToggle = () => {
    trackEvent('CLICK', { action: 'rca_edit_mode_toggle' });
    setEditMode(!editMode);
  };

  const formatText = (section, command) => {
    trackEvent('CLICK', { action: `rca_format_${command}` });
    
    const editor = editorRefs.current[section];
    if (editor) {
      editor.focus();
      if (command === "createLink") {
        const url = prompt("Enter link URL:");
        if (url) document.execCommand(command, false, url);
      } else {
        document.execCommand(command, false, null);
      }
    }
  };

  const handleContentChange = (section, value) => {
    setContent((prev) => ({ ...prev, [section]: value }));
  };

  return (
    <div>
      {/* Full width sticky header */}
      <div className="sticky top-0 z-10 flex justify-between items-center border-b bg-white px-4 py-3 mb-1.5 -mt-12">
        <h1 className="text-lg font-bold">Root Cause Analysis</h1>
        <div className="flex gap-2">
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
          <Button className="px-3 py-1 text-sm" onClick={handleToggle}>
            {editMode ? "Disable Edit Mode" : "Enable Edit Mode"}
          </Button>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto space-y-6">
        {sections.map((section) => (
          <div
            key={section}
            data-section={section}
            className="bg-white rounded-lg p-5 shadow-md flex flex-col gap-3"
          >
            <h2 className="text-lg font-semibold">{section}</h2>

            {editMode && (
              <div className="flex gap-1">
                <button
                  onClick={() => formatText(section, "bold")}
                  className="px-2 py-0.5 text-xs rounded bg-gray-200 hover:bg-gray-300 font-bold"
                  type="button"
                >
                  B
                </button>
                <button
                  onClick={() => formatText(section, "italic")}
                  className="px-2 py-0.5 text-xs rounded bg-gray-200 hover:bg-gray-300 italic font-bold"
                  type="button"
                >
                  I
                </button>
                <button
                  onClick={() => formatText(section, "underline")}
                  className="px-2 py-0.5 text-xs rounded bg-gray-200 hover:bg-gray-300 underline font-bold"
                  type="button"
                >
                  U
                </button>
                <button
                  onClick={() => formatText(section, "insertOrderedList")}
                  className="px-2 py-0.5 text-xs rounded bg-gray-200 hover:bg-gray-300 font-bold"
                  type="button"
                >
                  L
                </button>
                <button
                  onClick={() => formatText(section, "createLink")}
                  className="px-2 py-0.5 text-xs rounded bg-gray-200 hover:bg-gray-300 font-bold"
                  type="button"
                >
                  🔗
                </button>
              </div>
            )}

            {editMode ? (
              <div
                key={`${section}-edit`}
                ref={(el) => {
                  if (el && editorRefs.current[section] !== el) {
                    editorRefs.current[section] = el;
                    el.innerHTML = content[section] || "";
                  }
                }}
                className="min-h-[100px] border border-gray-300 rounded p-3 text-[15px] outline-none [&_ol]:list-decimal [&_ol]:ml-6 [&_ul]:list-disc [&_ul]:ml-6"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) =>
                  handleContentChange(section, e.currentTarget.innerHTML)
                }
                spellCheck={false}
              />
            ) : (
              <div
                className="min-h-[80px] border border-gray-300 rounded p-3 bg-white text-[15px] [&_ol]:list-decimal [&_ol]:ml-6 [&_ul]:list-disc [&_ul]:ml-6"
                dangerouslySetInnerHTML={{
                  __html: typeof window !== 'undefined' && content[section] 
                    ? content[section] 
                    : content[section] || `No details provided.`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
