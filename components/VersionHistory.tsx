"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { useCombinedData } from "@/contexts/CombinedDataContext";

export default function VersionHistory() {
  const { globalData, addData, deleteData, editData } = useData();
  const { saveCombinedData, isCombinedSaving } = useCombinedData();

  const [inputRow, setInputRow] = useState([
    { date: "", name: "", update: "" },
    { date: "", name: "", update: "" },
  ]);

  const [activeEditCell, setActiveEditCell] = useState(null);
  const [editFormData, setEditFormData] = useState({
    _id: "",
    date: "",
    name: "",
    update: "",
  });

  const [shouldFocusNewRow, setShouldFocusNewRow] = useState(false);
  const firstNewInputRef = useRef(null);

  useEffect(() => {
    if (shouldFocusNewRow && firstNewInputRef.current) {
      firstNewInputRef.current.focus();
      setShouldFocusNewRow(false);
    }
  }, [shouldFocusNewRow]);

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCellClick = (rowId, field) => {
    const rowToEdit = globalData.find((row) => row._id === rowId);
    if (rowToEdit) {
      setEditFormData({ ...rowToEdit }); // include _id
      setActiveEditCell({ id: rowId, field });
    }
  };

  const handleInputBlur = async (rowId, field) => {
    setActiveEditCell(null);
    const originalRow = globalData.find((row) => row._id === rowId);
    const currentValue = editFormData[field];

    // If all fields are empty, delete
    if (!editFormData.date && !editFormData.name && !editFormData.update) {
      await deleteData(rowId);
      return;
    }

    // If data has changed, update it fully
    if (originalRow && originalRow[field] !== currentValue) {
      const updatedItem = {
        _id: rowId,
        date: editFormData.date,
        name: editFormData.name,
        update: editFormData.update,
      };
      await editData(rowId, updatedItem);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...inputRow];
    updated[index][field] = value;

    setInputRow(updated);

    const lastTwo = updated.slice(-2);
    const anyFilled = lastTwo.some((row) => row.date || row.name || row.update);

    if (anyFilled) {
      setInputRow([...updated, { date: "", name: "", update: "" }]);
    }
  };

  const handleAddNewEntry = async (index) => {
    const currentRow = inputRow[index];
    if (!currentRow.date || !currentRow.name || !currentRow.update) return;

    const dataToSubmit = {
      date: currentRow.date,
      name: currentRow.name,
      update: currentRow.update,
    };

    try {
      await addData(dataToSubmit);
      setInputRow([
        { date: "", name: "", update: "" },
        { date: "", name: "", update: "" },
      ]);
      setShouldFocusNewRow(true);
    } catch (error) {
      console.error("Failed to add new entry:", error);
    }
  };

  const handleSaveCombinedData = async () => {
    const dataToSave = {
      versionHistorySnapshot: globalData,
    };
    await saveCombinedData(dataToSave);
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <Button onClick={handleSaveCombinedData} disabled={isCombinedSaving}>
          {isCombinedSaving ? "Saving Combined Data..." : "Save Combined Data"}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {globalData.map((row) => (
            <TableRow key={row._id}>
              <TableCell onClick={() => handleCellClick(row._id, "date")}>
                {activeEditCell?.id === row._id &&
                activeEditCell?.field === "date" ? (
                  <Input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => handleEditChange("date", e.target.value)}
                    onBlur={() => handleInputBlur(row._id, "date")}
                    autoFocus
                  />
                ) : (
                  row.date
                )}
              </TableCell>
              <TableCell onClick={() => handleCellClick(row._id, "name")}>
                {activeEditCell?.id === row._id &&
                activeEditCell?.field === "name" ? (
                  <Input
                    value={editFormData.name}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    onBlur={() => handleInputBlur(row._id, "name")}
                    autoFocus
                  />
                ) : (
                  row.name
                )}
              </TableCell>
              <TableCell onClick={() => handleCellClick(row._id, "update")}>
                {activeEditCell?.id === row._id &&
                activeEditCell?.field === "update" ? (
                  <Input
                    value={editFormData.update}
                    onChange={(e) => handleEditChange("update", e.target.value)}
                    onBlur={() => handleInputBlur(row._id, "update")}
                    autoFocus
                  />
                ) : (
                  row.update
                )}
              </TableCell>
            </TableRow>
          ))}

          {/* Input rows */}
          {inputRow.map((row, index) => (
            <TableRow key={`input-${index}`}>
              <TableCell>
                <Input
                  type="date"
                  value={row.date}
                  onChange={(e) =>
                    handleInputChange(index, "date", e.target.value)
                  }
                  ref={index === 0 ? firstNewInputRef : null}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.name}
                  onChange={(e) =>
                    handleInputChange(index, "name", e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  value={row.update}
                  onChange={(e) =>
                    handleInputChange(index, "update", e.target.value)
                  }
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
