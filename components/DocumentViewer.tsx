"use client";
import React, { useState, useEffect, useCallback } from "react";

interface VersionHistoryEntry {
  _id: string;
  date: string;
  name: string;
  update: string;
}

interface DescriptionEntry {
  _id: string;
  content: string;
  createdAt: string;
}

export default function DocumentViewer() {
  const [versionHistoryData, setVersionHistoryData] = useState<
    VersionHistoryEntry[]
  >([]);
  const [descriptionData, setDescriptionData] = useState<DescriptionEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [versRes, descRes] = await Promise.all([
        fetch("/api/dataa"),
        fetch("/api/description"),
      ]);
      if (!versRes.ok) {
        const err = await versRes.json();
        throw new Error(err.error || "Failed to fetch version history");
      }
      if (!descRes.ok) {
        const err = await descRes.json();
        throw new Error(err.error || "Failed to fetch description");
      }
      const vData: VersionHistoryEntry[] = await versRes.json();
      const dData: DescriptionEntry[] = await descRes.json();
      setVersionHistoryData(vData);
      setDescriptionData(dData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected fetch error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoth();
  }, [fetchBoth]);

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

        {/* Version History Table */}
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
              {versionHistoryData.map((entry, index) => (
                <tr key={entry._id || index} className="even:bg-gray-50">
                  <td className="border p-2">{entry.date || "N/A"}</td>
                  <td className="border p-2">{entry.name || "N/A"}</td>
                  <td className="border p-2">{entry.update || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Description Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <div className="space-y-6">
            {descriptionData.map((desc, index) => (
              <div key={desc._id}>
                <h3 className="font-semibold mb-1">{index + 1}.</h3>
                <p className="text-gray-800 document-paragraph">
                  {desc.content || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-gray-500 mt-12 text-sm font-serif italic">
          --- End of Document ---
        </p>
      </div>

      {/* Word Document Style */}
      <style jsx>{`
        .document-page {
          font-family: "Times New Roman", Times, serif;
          line-height: 1.6;
          color: #333;
          box-sizing: border-box;
          min-height: 800px;
        }
        .document-paragraph {
          margin-bottom: 0.8em;
          text-indent: 0.5in;
        }
        h1,
        h2 {
          font-family: "Arial", sans-serif;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        h1.document-paragraph,
        h2.document-paragraph {
          text-indent: 0;
        }
      `}</style>
    </div>
  );
}
