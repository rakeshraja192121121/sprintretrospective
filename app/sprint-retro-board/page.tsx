"use client";
import Header from "@/components/header";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Item {
  _id: string;
  description: string;
  type: string;
}

interface EditPopup {
  show: boolean;
  id: string | null;
  text: string;
  type: string;
}

export default function Home() {
  const [data, setData] = useState<Item[]>([]);
  const [editPopup, setEditPopup] = useState<EditPopup>({
    show: false,
    id: null,
    text: "",
    type: "",
  });
  const [addPopup, setAddPopup] = useState({
    show: false,
    description: "",
    type: "",
  });

  // Fetch data from server
  const fetchData = async () => {
    try {
      const response = await fetch("/api/routess");
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItem = async (description, type) => {
    if (!description.trim()) return;
    try {
      const response = await fetch("/api/routess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, type: type.toLowerCase() }),
      });
      const result = await response.json();
      setData((prev) => [...prev, result.newItem]);
      setAddPopup({ show: false, description: "", type: "" });

      fetchData();
    } catch (error) {
      console.error("Add error:", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(`/api/routess/${id}`, { method: "DELETE" });
      setData((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const updateItem = async () => {
    const { id, text } = editPopup;
    if (!id || !text.trim()) return;
    try {
      const response = await fetch(`/api/routess/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      });

      if (response.ok) {
        setData((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, description: text } : item
          )
        );
        setEditPopup({ show: false, id: null, text: "", type: "" });
      } else {
        console.error("Update failed:", await response.json());
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const renderCards = (typeLabel, color) => {
    return data
      .filter((item) => item?.type === typeLabel)
      .map((item) => (
        <Card
          key={item._id}
          className={`m-0.5 ${color} relative rounded-none max-w-[390px] min-h-[130px]`}
        >
          <CardContent className="text-xs font-bold break-words w-[340px]">
            {item.description}
            <div className=" absolute flex top-[5px] mt-6 right-[0.5rem] ">
              {/* Delete */}
              <svg
                onClick={() => deleteItem(item._id)}
                className="w-6 h-6 absolute bottom-0 right-0 text-red-600 cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                />
              </svg>

              {/* Edit */}
              <svg
                onClick={() =>
                  setEditPopup({
                    show: true,
                    id: item._id,
                    type: item.type,
                    text: item.description,
                  })
                }
                className="w-6 h-6 text-blue-800 absolute bottom-0 right-6 cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                />
              </svg>
            </div>
          </CardContent>
        </Card>
      ));
  };
  const typeMapping = {
    well: "What went well",
    improve: "What can be improved",
    action: "Action items",
  };

  return (
    <div className="relative overflow-hidden">
      {editPopup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded-lg w-[90%] max-w-[400px]">
            <h1 className="text-center font-bold">
              {typeMapping[editPopup.type]}
            </h1>
            <textarea
              className="w-full h-40  focus:outline-none  p-2"
              value={editPopup.text}
              onChange={(e) =>
                setEditPopup({ ...editPopup, text: e.target.value })
              }
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() =>
                  setEditPopup({ show: false, id: null, text: "", type: " " })
                }
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={updateItem}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {addPopup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded-lg w-[90%] max-w-[400px]">
            <h1 className="text-center font-bold">
              Add {typeMapping[addPopup.type]}
            </h1>
            <textarea
              className="w-full h-40 border border-e-black p-2"
              value={addPopup.description}
              onChange={(e) =>
                setAddPopup({ ...addPopup, description: e.target.value })
              }
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={() =>
                  setAddPopup({ show: false, description: "", type: "" })
                }
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => addItem(addPopup.description, addPopup.type)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <Header />

      <div className="flex gap-4 p-4 min-w-[1200px] max-w-full overflow-x-auto">
        {/* What went well */}
        <div className="w-full">
          <div className="flex justify-center">
            <label className="p-2 font-bold block text-center  text-black  ">
              What went well
            </label>
            <svg
              onClick={() =>
                setAddPopup({ show: true, type: "well", description: "" })
              }
              className="w-9 h-9 ml-1 text-black "
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>

          {renderCards("well", "bg-green-200")}
        </div>

        {/* What can be improved */}
        <div className="w-full">
          <div className="flex justify-center">
            <label className="p-2 font-bold block text-center  text-black ">
              What can be improved
            </label>
            <svg
              onClick={() =>
                setAddPopup({ show: true, type: "improve", description: "" })
              }
              className="w-9 h-9 ml-1 text-black "
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>

          {renderCards("improve", "bg-red-200")}
        </div>

        {/* Action Item */}
        <div className="w-full">
          <div className="flex justify-center">
            <label className="p-2 font-bold block text-center ">
              Action Item
            </label>
            <svg
              onClick={() =>
                setAddPopup({ show: true, type: "action", description: "" })
              }
              className="w-9 h-9 ml-1  text-black "
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 7.757v8.486M7.757 12h8.486M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>

          {renderCards("action", "bg-indigo-200")}
        </div>
      </div>
    </div>
  );
}
