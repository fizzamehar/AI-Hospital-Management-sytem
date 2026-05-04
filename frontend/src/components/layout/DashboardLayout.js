"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black text-white">

      {/* Sidebar */}
      <div className="w-64 hidden md:block">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="p-6 md:p-8 space-y-6">

          {children}

        </main>

      </div>

    </div>
  );
}