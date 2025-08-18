"use client";

import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Eye } from "lucide-react";
import { useRouter, usePathname, useParams } from "next/navigation";

export default function PRDLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const id = params?.id;

  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setMobile(window.innerWidth < 768);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (
      mobile &&
      id &&
      !pathname.match(/^\/PRD\/[^\/]+$/) // matches /PRD/someId exactly (no trailing slash or path)
    ) {
      router.push(`/PRD/${id}`);
    }
  }, [mobile, pathname, router, id]);

  const handlePreviewClick = () => {
    if (id) {
      router.push(`/PRD/${id}`);
    } else {
      alert("ID not found for preview");
    }
  };

  return (
    <Provider store={store}>
      <div className="flex flex-col min-h-screen">
        <div>
          {!mobile && <NavBar />}

          <div className="flex justify-end px-4 py-2 dark:bg-gray-800">
            <button
              onClick={handlePreviewClick}
              title="Preview Document"
              className="flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-blue-950 font-medium text-white dark:bg-gray-700 hover:bg-blue-700 dark:hover:bg-gray-600 transition"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>

        <main className="flex-grow p-4   ">{children}</main>
      </div>
    </Provider>
  );
}
