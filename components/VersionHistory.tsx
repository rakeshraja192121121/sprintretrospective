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

type EditCell = { id: string; field: string } | null;

interface VersionEntry {
  _id: string;
  date: string;
  name: string;
  update: string;
}

interface VersionState {
  versionHistory: VersionEntry[];
  editingId: string | null;
  draftEntry: Partial<VersionEntry>;
}

export default function VersionHistory() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const workspaceId = id;

  const versionHistory = useSelector(
    (state: { version: VersionState }) => state.version.versionHistory || []
  );

  const [editFormData, setEditFormData] = useState<VersionEntry>({
    _id: "",
    date: "",
    name: "",
    update: "",
  });

  const [inputRow, setInputRow] = useState<
    { date: string; name: string; update: string }[]
  >([
    { date: "", name: "", update: "" },
    { date: "", name: "", update: "" },
  ]);

  const [activeEditCell, setActiveEditCell] = useState<EditCell>(null);
  const [shouldFocusNewRow, setShouldFocusNewRow] = useState(false);
  const firstNewInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleEditChange = (field: keyof VersionEntry, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputBlur = (indexOrId: number | string, field: string) => {
    if (typeof indexOrId === "number") {
      // For new rows, add entry immediately on blur
      handleAddNewEntry(indexOrId);
    } else {
      const rowId = indexOrId;
      setActiveEditCell(null);
      dispatch(setEditingId(null));
      const originalEntry = versionHistory.find(
        (entry) => entry?._id === rowId
      );
      const currentValue = editFormData[field as keyof VersionEntry];
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
        originalEntry[field as keyof VersionEntry]?.trim() !==
          currentValue.trim()
      ) {
        const updatedEntry: VersionEntry = {
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

  const handleInputChange = (
    index: number,
    field: keyof VersionEntry,
    value: string
  ) => {
    const updated = [...inputRow];
    updated[index][field] = value;
    setInputRow(updated);

    const lastTwo = updated.slice(-2);
    const anyFilled = lastTwo.some((row) => row.date || row.name || row.update);
    if (anyFilled)
      setInputRow([...updated, { date: "", name: "", update: "" }]);
  };

  const handleAddNewEntry = async (index: number) => {
    const currentRow = inputRow[index];
    if (!currentRow.date || !currentRow.name || !currentRow.update) return;

    // Temporary entry with client-generated _id for UI only
    const tempEntry: VersionEntry = {
      _id: crypto.randomUUID(),
      date: currentRow.date,
      name: currentRow.name,
      update: currentRow.update,
    };

    // Dispatch immediately for UI responsiveness
    dispatch(addVersionEntry(tempEntry));

    // Prepare POST payload without _id but with workspaceId
    const entryToPost = {
      workspaceId,
      date: currentRow.date,
      name: currentRow.name,
      update: currentRow.update,
    };

    try {
      const res = await fetch("/api/dataa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryToPost),
      });
      if (!res.ok) throw new Error("Failed to add new entry");

      // Replace temporary entry with backend saved entry (including real _id)
      const savedEntry: VersionEntry = await res.json();
      dispatch(updateVersionEntry(savedEntry));

      // Reset input rows to two empty rows
      setInputRow([
        { date: "", name: "", update: "" },
        { date: "", name: "", update: "" },
      ]);

      setShouldFocusNewRow(true);
    } catch (error) {
      console.error("Failed to add new entry:", error);
      // Remove temporary entry on failure
      dispatch(removeVersionEntry(tempEntry._id));
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
          {versionHistory
            .filter((row) => row != null)
            .map((row) => (
              <TableRow key={row._id}>
                {(["date", "name", "update"] as (keyof VersionEntry)[]).map(
                  (field) => (
                    <TableCell
                      key={`${row._id}-${field}`}
                      onClick={() => handleCellClick(row._id, field)}
                    >
                      {activeEditCell?.id === row._id &&
                      activeEditCell?.field === field ? (
                        <Input
                          type={field === "date" ? "date" : "text"}
                          value={editFormData[field] || ""}
                          onChange={(e) =>
                            handleEditChange(field, e.target.value)
                          }
                          onBlur={() => handleInputBlur(row._id, field)}
                          autoFocus
                        />
                      ) : (
                        row?.[field] || ""
                      )}
                    </TableCell>
                  )
                )}
              </TableRow>
            ))}
          {inputRow.map((row, index) => (
            <TableRow key={`input-${index}`}>
              <TableCell>
                <Input
                  type="date"
                  value={row.date}
                  onChange={(e) =>
                    handleInputChange(index, "date", e.target.value)
                  }
                  onBlur={() => handleInputBlur(index, "date")}
                  ref={index === 0 ? firstNewInputRef : null}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.name}
                  onChange={(e) =>
                    handleInputChange(index, "name", e.target.value)
                  }
                  onBlur={() => handleInputBlur(index, "name")}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.update}
                  onChange={(e) =>
                    handleInputChange(index, "update", e.target.value)
                  }
                  onBlur={() => handleInputBlur(index, "update")}
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
