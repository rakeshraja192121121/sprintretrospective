"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Tab from "@/components/Tab";
import { ClientProviders } from "@/components/ClientProviders";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Pages where layout should be hidden
  const noLayoutRoutes = ["/login", "/register", "/forgot-password"];
  const hideLayout = noLayoutRoutes.includes(pathname);

  return (
    <>
      {!hideLayout && (
        <div className="sticky top-0 z-999 w-full flex flex-row border-b-1 bg-white">
          <a href="https://www.turbify.com" aria-label="Turbify">
            <Image
              src="https://sep.turbifycdn.com/nrp/image/turbify/newturbifylogo.png"
              alt="Turbify"
              width={100}
              height={40}
              className="shrink-0 h-10 w-auto object-contain m-2"
            />
          </a>
          <Tab />
        </div>
      )}

      <ClientProviders>{children}</ClientProviders>
    </>
  );
}
