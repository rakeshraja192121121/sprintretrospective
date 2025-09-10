"use client";

import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Provider } from "react-redux";
import { store } from "@/store";
import { Eye } from "lucide-react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { trackEvent } from "@/lib/tracker";

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
      !pathname.match(/^\/PRD\/[^\/]+$/) // matches /PRD/someId
    ) {
      router.push(`/PRD/${id}`);
    }
  }, [mobile, pathname, router, id]);

  const handlePreviewClick = () => {
    if (id) {
      router.push(`/PRD/${id}`);
      trackEvent("click", { action: "open's preview page " });
    } else {
      alert("ID not found for preview");
    }
  };

  return (
    <Provider store={store}>
      <div className="flex flex-col">
        <div className="sticky top-[64px] z-40 bg-white">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex-1 flex justify-center">
              {!mobile && <NavBar />}
            </div>
            <button
              onClick={handlePreviewClick}
              title="Preview Document"
              className="flex items-center gap-1 px-3 py-1 rounded-md text-sm bg-blue-950 font-medium text-white dark:bg-gray-700 hover:bg-blue-700 dark:hover:bg-gray-600 transition"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>

        <main
          className="px-4 pb-4 overflow-y-auto scrollbar-hide"
          style={{ maxHeight: "calc(100vh - 168px)" }}
        >
          {children}
        </main>
      </div>
    </Provider>
  );
}
