import VersionHistory from "@/components/VersionHistory";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Version History",
};

export default function page() {
  return (
    <div>
      <VersionHistory />
    </div>
  );
}
