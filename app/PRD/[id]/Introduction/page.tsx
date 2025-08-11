import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Introduction",
};

export default function page() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <h1 className="text-3xl font-bold mb-4 text-gray-700">
          🚧 Page Under Development
        </h1>
        <p className="text-lg text-gray-500">
          working hard to bring this page to life. Please check back soon!
        </p>
      </div>
    </div>
  );
}
