"use client";

import { Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5 backdrop-blur-lg">
      
      <h2 className="text-xl font-semibold">Hospital Dashboard</h2>

      <div className="flex items-center gap-4">
        <Bell className="cursor-pointer hover:text-blue-400" />
        <User className="cursor-pointer hover:text-blue-400" />
      </div>

    </div>
  );
}