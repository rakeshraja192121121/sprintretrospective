"use client";

import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Eye } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function PRDLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobile, setmobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        setmobile(width < 768); // set isMobile true if width < 768
      }
    };

    handleResize(); // Run once on first load
    window.addEventListener("resize", handleResize); // Watch for resize

    return () => {
      window.removeEventListener("resize", handleResize); // cleanup
    };
  }, []);

  useEffect(() => {
    if (mobile && pathname !== "/PRD") {
      router.push("/PRD");
    }
  }, [mobile, pathname, router]); // run this when isMobile or route changes

  const handlePreviewClick = () => {
    router.push("/PRD");
  };

  return (
    <Provider store={store}>
      <div className="flex flex-col min-h-screen">
        {!mobile && <NavBar />}

        <div className="flex justify-end px-4 py-2  dark:bg-gray-800">
          <button
            onClick={handlePreviewClick}
            title="Preview Document"
            className="flex items-center gap-1 px-3 py-1 rounded-md text-sm  bg-blue-950 font-medium text-white  dark:bg-gray-700 hover:bg-blue-700 dark:hover:bg-gray-600 transition"
          >
            <Eye size={18} />
          </button>
        </div>

        <main className="flex-grow p-4">{children}</main>
      </div>
    </Provider>
  );
}
