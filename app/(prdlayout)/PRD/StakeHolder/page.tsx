import Stakeholder from "@/components/StakeHolders";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "stakeHolders",
};

export default function page() {
  return (
    <div>
      <Stakeholder />
    </div>
  );
}
