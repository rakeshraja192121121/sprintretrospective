"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useRouter } from "next/navigation";

export default function Tab() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/sprint-retro-board");
  };
  const handleClick1 = () => {
    router.push("/PRD");
  };
  const handleClick2 = () => {
    router.push("/Projects");
  };
  const handleClick3 = () => {
    router.push("/RCA");
  };
  return (
    <div className="flex flex-row gap-x-2 ml-3">
      <Tabs>
        <TabsList>
          <TabsTrigger value="page" onClick={handleClick2}>
            Projects
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs>
        <TabsList>
          <TabsTrigger value="page" onClick={handleClick1}>
            PRD
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs>
        <TabsList>
          <TabsTrigger value="page" onClick={handleClick}>
            Restrospection
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs>
        <TabsList>
          <TabsTrigger value="page" onClick={handleClick3}>
            RCA
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
