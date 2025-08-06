"use client";

import React from "react";
import { useSelector } from "react-redux";

export default function DocumentViewer() {
  const descriptions = useSelector((state: any) => state.editor.descriptions);
  const draftContent = useSelector((state: any) => state.editor.draftContent);
  const versionHistory = useSelector(
    (state: any) => state.version.versionHistory
  );
  const quickLinks = useSelector((state: any) => state.quickLinks);
  const stakeholders = useSelector((state: any) => state.stakeholders);

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
              {versionHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center p-4 italic text-gray-500"
                  >
                    No version history available.
                  </td>
                </tr>
              ) : (
                versionHistory.map((entry: any) => (
                  <tr key={entry._id} className="even:bg-gray-50">
                    <td className="border p-2">{entry.date || "N/A"}</td>
                    <td className="border p-2">{entry.name || "N/A"}</td>
                    <td className="border p-2">{entry.update || "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/*quick Links */}

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          {quickLinks.length === 0 ? (
            <p className="text-gray-500 italic">No quick links available.</p>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {quickLinks
                .filter((link: any) => link.name || link.link)
                .map((link: any, idx: number) => (
                  <li key={idx}>
                    {link.link ? (
                      <a
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link.name || link.link}
                      </a>
                    ) : (
                      <span>{link.name}</span>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </section>

        {/* Description Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          {descriptions.length > 0 ? (
            descriptions.map((desc: any) => {
              const containsTable = desc.content.includes('class="table-grid"');
              return (
                <div
                  key={desc._id}
                  className={
                    containsTable ? "saved-content-display mb-6" : "mb-6"
                  }
                  dangerouslySetInnerHTML={{ __html: desc.content }}
                />
              );
            })
          ) : (
            <p className="text-gray-500 italic">No saved descriptions.</p>
          )}

          {draftContent && draftContent.trim() !== "" && (
            <div
              className="text-gray-700 document-paragraph"
              dangerouslySetInnerHTML={{ __html: draftContent }}
            />
          )}
        </section>

        {/* Stakeholders Section  */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Stakeholders</h2>
          {stakeholders.length === 0 ? (
            <p className="text-gray-500 italic">No stakeholders available.</p>
          ) : (
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="border p-2">Role</th>
                  <th className="border p-2">Name</th>
                </tr>
              </thead>
              <tbody>
                {stakeholders
                  .filter((s: any) => s.role || s.name)
                  .map((s: any, idx: number) => (
                    <tr key={idx} className="even:bg-gray-50">
                      <td className="border p-2">{s.role || "N/A"}</td>
                      <td className="border p-2">{s.name || "N/A"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </section>

        <p className="text-center text-gray-500 mt-12 text-sm font-serif italic">
          --- End of Document ---
        </p>
      </div>

      {/* Styles */}
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
          font-family: Arial, sans-serif;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          text-indent: 0;
        }
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
        .saved-content-display .cell-header {
          background: #deedfa;
          font-weight: bold;
          min-height: 60px;
          border-bottom: 2px solid black !important;
        }
        .saved-content-display .cell:hover,
        .saved-content-display .cell:focus {
          background: #edf4ff;
          outline: 2px solid black;
          z-index: 3;
        }
        table {
          border-collapse: collapse;
        }
      `}</style>
    </div>
  );
}
