import Workdesc from "@/components/Workdesc";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "description",
};

export default function page() {
  return (
    <div>
      <Workdesc />
    </div>
  );
}
