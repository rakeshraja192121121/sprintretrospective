import QuickLinks from "@/components/Quicklinks";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuickLinks",
};

export default function page() {
  return (
    <div>
      <QuickLinks />
    </div>
  );
}
