"use client";

import React from "react";
import { useEditorStore } from "@/store/useEditorStore";

interface VersionHistoryEntry {
  _id: string;
  date: string;
  name: string;
  update: string;
}

export default function DocumentViewer() {
  const [versionHistoryData, setVersionHistoryData] = React.useState<
    VersionHistoryEntry[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ Use Zustand global state
  const descriptionHTML = useEditorStore((state) => state.descriptionHTML);

  React.useEffect(() => {
    const fetchVersionHistory = async () => {
      try {
        const versRes = await fetch("/api/dataa");
        if (!versRes.ok) throw new Error("Failed to fetch version history");
        const vData: VersionHistoryEntry[] = await versRes.json();
        setVersionHistoryData(vData);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Unexpected error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersionHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading document data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 bg-gray-100 min-h-screen">
      <div className="document-page bg-white shadow-lg rounded-lg p-8 sm:p-12 lg:p-16 w-full max-w-4xl border border-gray-200">
        <h1 className="text-center text-4xl font-serif font-bold mb-8 text-gray-800">
          PRD
        </h1>
        <p className="text-center text-gray-600 mb-10 font-serif text-lg">
          Generated on: {new Date().toLocaleDateString()}
        </p>

        {/* Version History Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Version History</h2>
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Update</th>
              </tr>
            </thead>
            <tbody>
              {versionHistoryData.map((entry) => (
                <tr key={entry._id} className="even:bg-gray-50">
                  <td className="border p-2">{entry.date || "N/A"}</td>
                  <td className="border p-2">{entry.name || "N/A"}</td>
                  <td className="border p-2">{entry.update || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {versionHistoryData.length === 0 && (
            <p className="text-gray-500 italic mt-4">
              No version history available.
            </p>
          )}
        </section>

        {/* Description Section from Global State */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          {descriptionHTML ? (
            <div
              className="text-gray-800 document-paragraph"
              dangerouslySetInnerHTML={{ __html: descriptionHTML }}
            />
          ) : (
            <p className="text-gray-500 italic">
              No description content available.
            </p>
          )}
        </section>

        <p className="text-center text-gray-500 mt-12 text-sm font-serif italic">
          --- End of Document ---
        </p>
      </div>

      <style jsx>{`
        .document-page {
          font-family: "Times New Roman", Times, serif;
          line-height: 1.6;
          color: #333;
          min-height: 800px;
        }
        .document-paragraph {
          margin-bottom: 0.8em;
          text-indent: 0.5in;
        }
        .document-page h1,
        .document-page h2,
        .document-page h3 {
          font-family: "Arial", sans-serif;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          text-indent: 0;
        }
      `}</style>
    </div>
  );
}
