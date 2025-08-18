// app/login/layout.tsx
import React from "react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Return only the login page without navbar/sidebar
  return <div>{children}</div>;
}
