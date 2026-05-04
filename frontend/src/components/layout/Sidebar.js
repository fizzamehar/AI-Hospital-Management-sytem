"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Stethoscope, Calendar, 
  CreditCard, FileText, Bot, LogOut, Settings 
} from 'lucide-react';
import { logout, getUser } from '@/lib/auth';

const Sidebar = ({ onClose }) => {
  const pathname = usePathname();
  const user = getUser();
  const role = user?.role?.toLowerCase() || 'patient';

  const menuConfig = {
    admin: [
      { name: 'Analytics', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
      { name: 'Manage Doctors', href: '/dashboard/doctors', icon: Stethoscope },
      { name: 'Patient Records', href: '/dashboard/patients', icon: Users },
      { name: 'Medical Reports', href: '/dashboard/reports', icon: FileText },
      { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
      { name: 'System Billing', href: '/dashboard/billing', icon: CreditCard },
      { name: 'Profile', href: '/dashboard/profile', icon: Settings },
    ],
    doctor: [
      { name: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
      { name: 'Patients', href: '/dashboard/patients', icon: Users },
      { name: 'Medical Reports', href: '/dashboard/reports', icon: FileText },
      { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
      { name: 'Profile', href: '/dashboard/profile', icon: Settings },
    ],
    patient: [
      { name: 'My Health', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
      { name: 'Medical Records', href: '/dashboard/reports', icon: FileText },
      { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: FileText },
      { name: 'My Bills', href: '/dashboard/billing', icon: CreditCard },
      { name: 'Health AI', href: '/dashboard/ai', icon: Bot },
      { name: 'Profile', href: '/dashboard/profile', icon: Settings },
    ]
  };

  const activeLinks = menuConfig[role] || menuConfig.patient;

  return (
    <aside className="w-72 h-screen bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl relative z-20">
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-2xl text-blue-400">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-blue-500/20">+</div>
          MedCore
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">Main Menu</p>
        {activeLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}>
              <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 bg-slate-950/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold">{role}</p>
          </div>
          <button onClick={logout} className="text-slate-500 hover:text-rose-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;