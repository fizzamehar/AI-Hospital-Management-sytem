"use client";
import Sidebar from '@/components/layout/Sidebar';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Portal...</div>;

  return (
    <div className="flex min-h-screen bg-slate-950 flex-col md:flex-row relative overflow-hidden">
      {/* Background glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900/80 backdrop-blur-xl border-b border-white/10 z-40 px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-400">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">+</div>
          MedCore
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed md:sticky top-0 h-screen z-50 md:z-0 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 w-full p-4 md:p-8 pt-24 md:pt-8 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}