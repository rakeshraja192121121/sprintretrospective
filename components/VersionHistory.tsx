"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useSelector, useDispatch } from "react-redux";
import {
  setVersionHistory,
  addVersionEntry,
  updateVersionEntry,
  removeVersionEntry,
  setEditingId,
} from "@/store/versionSlice";

// Local TypeScript type definitions
type VersionEntry = {
  _id: string;
  date: string;
  name: string;
  update: string;
};
type VersionState = {
  version: {
    versionHistory: VersionEntry[];
    editingId: string | null;
  };
};
type RootState = VersionState;

export default function VersionHistory() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const workspaceId = id;

  // Use explicit types for selectors
  const versionHistory = useSelector(
    (state: RootState) => state.version.versionHistory || []
  );
  const editingId = useSelector((state: RootState) => state.version.editingId);

  const [editFormData, setEditFormData] = useState<VersionEntry>({
    _id: "",
    date: "",
    name: "",
    update: "",
  });

  const [inputRow, setInputRow] = useState([
    { date: "", name: "", update: "" },
    { date: "", name: "", update: "" },
  ]);

  const [activeEditCell, setActiveEditCell] = useState<null | {
    id: string;
    field: string;
  }>(null);
  const [shouldFocusNewRow, setShouldFocusNewRow] = useState(false);
  const firstNewInputRef = useRef<HTMLInputElement>(null);
  const [typingTimeouts, setTypingTimeouts] = useState<
    Record<number, NodeJS.Timeout>
  >({});

  useEffect(() => {
    if (!workspaceId) return;
    async function fetchData() {
      try {
        const res = await fetch(`/api/dataa?workspaceId=${workspaceId}`);
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        dispatch(setVersionHistory(Array.isArray(data) ? data : []));
      } catch (error) {
        console.error("Error loading version history data:", error);
      }
    }
    fetchData();
  }, [dispatch, workspaceId]);

  useEffect(() => {
    if (shouldFocusNewRow && firstNewInputRef.current) {
      firstNewInputRef.current.focus();
      setShouldFocusNewRow(false);
    }
  }, [shouldFocusNewRow]);

  const handleCellClick = (rowId: string, field: string) => {
    const rowToEdit = versionHistory.find((row) => row?._id === rowId);
    if (rowToEdit) {
      setEditFormData({ ...rowToEdit });
      setActiveEditCell({ id: rowId, field });
      dispatch(setEditingId(rowId));
    }
  };

  const handleEditChange = (field: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputBlur = (indexOrId: number | string, field?: string) => {
    if (typeof indexOrId === "number") {
      if (typingTimeouts[indexOrId]) clearTimeout(typingTimeouts[indexOrId]);
      handleAddNewEntry(indexOrId);
    } else {
      const rowId = indexOrId;
      setActiveEditCell(null);
      dispatch(setEditingId(null));
      const originalEntry = versionHistory.find(
        (entry) => entry?._id === rowId
      );
      const currentValue = field
        ? editFormData[field as keyof VersionEntry]
        : "";
      const isAllEmpty =
        !editFormData.date.trim() &&
        !editFormData.name.trim() &&
        !editFormData.update.trim();
      if (isAllEmpty) {
        dispatch(removeVersionEntry(rowId));
        fetch(`/api/dataa?id=${rowId}`, { method: "DELETE" }).catch((err) =>
          console.error("Failed to delete entry:", err)
        );
        return;
      }
      if (
        originalEntry &&
        field &&
        originalEntry[field as keyof VersionEntry]?.trim() !==
          currentValue.trim()
      ) {
        const updatedEntry = {
          workspaceId,
          _id: rowId,
          date: editFormData.date || "",
          name: editFormData.name || "",
          update: editFormData.update || "",
        };
        dispatch(updateVersionEntry(updatedEntry));
        fetch(`/api/dataa`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEntry),
        }).catch((err) => console.error("Failed to update:", err));
      }
    }
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    const updated = [...inputRow];
    updated[index][field] = value;
    setInputRow(updated);
    if (typingTimeouts[index]) clearTimeout(typingTimeouts[index]);
    const timeoutId = setTimeout(() => {
      handleAddNewEntry(index);
    }, 5000);
    setTypingTimeouts((prev) => ({ ...prev, [index]: timeoutId }));
    const lastTwo = updated.slice(-2);
    const anyFilled = lastTwo.some((row) => row.date || row.name || row.update);
    if (anyFilled)
      setInputRow([...updated, { date: "", name: "", update: "" }]);
  };

  const handleAddNewEntry = async (index: number) => {
    const currentRow = inputRow[index];
    if (!currentRow.date || !currentRow.name || !currentRow.update) return;
    const newEntry = {
      workspaceId,
      date: currentRow.date,
      name: currentRow.name,
      update: currentRow.update,
    };
    try {
      dispatch(addVersionEntry(newEntry));
      const res = await fetch("/api/dataa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });
      if (!res.ok) throw new Error("Failed to add new entry");
      setInputRow([
        { date: "", name: "", update: "" },
        { date: "", name: "", update: "" },
      ]);
      setShouldFocusNewRow(true);
    } catch (error) {
      console.error("Failed to add new entry:", error);
    }
  };

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* versionHistory rows, each row MUST have key=row._id */}
          {versionHistory
            .filter((row) => row != null)
            .map((row) => (
              <TableRow key={row._id}>
                {["date", "name", "update"].map((field) => (
                  <TableCell
                    key={`${row._id}-${field}`}
                    onClick={() => handleCellClick(row._id, field)}
                  >
                    {activeEditCell?.id === row._id &&
                    activeEditCell?.field === field ? (
                      <Input
                        type={field === "date" ? "date" : "text"}
                        value={editFormData[field as keyof VersionEntry] || ""}
                        onChange={(e) =>
                          handleEditChange(field, e.target.value)
                        }
                        onBlur={() => handleInputBlur(row._id, field)}
                        autoFocus
                      />
                    ) : (
                      row?.[field as keyof VersionEntry] || ""
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {/* inputRow rows, key must be stable; use "input-N" */}
          {inputRow.map((row, index) => (
            <TableRow key={`input-${index}`}>
              <TableCell>
                <Input
                  type="date"
                  value={row.date}
                  onChange={(e) =>
                    handleInputChange(index, "date", e.target.value)
                  }
                  onBlur={() => handleInputBlur(index)}
                  ref={index === 0 ? firstNewInputRef : null}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.name}
                  onChange={(e) =>
                    handleInputChange(index, "name", e.target.value)
                  }
                  onBlur={() => handleInputBlur(index)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.update}
                  onChange={(e) =>
                    handleInputChange(index, "update", e.target.value)
                  }
                  onBlur={() => handleInputBlur(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddNewEntry(index);
                      e.preventDefault();
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
