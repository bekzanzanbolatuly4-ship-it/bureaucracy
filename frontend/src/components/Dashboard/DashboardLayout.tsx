import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between">
        <div />
      </div>
      {children}
    </div>
  );
}

