"use client";
import { useEffect, useState } from 'react';
import API from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Users, Calendar, Activity, DollarSign, ArrowUpRight, Loader2, Clock, FileText, Bell, CheckSquare } from 'lucide-react';

export default function DashboardHome() {
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointmentsCount: 0,
    reportsCount: 0,
    prescriptionsCount: 0,
    patientsCount: 0,
    doctorsCount: 0,
    revenue: 0,
    age: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all needed data
        const [aptRes, repRes, profRes] = await Promise.all([
          API.get('/appointments'),
          API.get('/medical-records'),
          API.get('/auth/profile')
        ]);
        
        let patCount = 0;
        let docCount = 0;
        let revCount = 0;
        let prescCount = 0;
        let ageCount = profRes.data?.patient?.age || 'N/A';
        
        if (user?.role === 'ADMIN' || user?.role === 'DOCTOR') {
          const patRes = await API.get('/patients');
          patCount = patRes.data.length;
          
          if (user?.role === 'DOCTOR') {
             const prescRes = await API.get('/prescriptions');
             prescCount = prescRes.data.length;
          }
        }

        if (user?.role === 'ADMIN') {
          const docRes = await API.get('/doctors');
          docCount = docRes.data.length;

          const billRes = await API.get('/billing').catch(() => ({ data: [] }));
          revCount = billRes.data?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
        }

        setStats({
          appointmentsCount: aptRes.data.length,
          reportsCount: repRes.data.length,
          prescriptionsCount: prescCount,
          patientsCount: patCount,
          doctorsCount: docCount,
          revenue: revCount,
          age: ageCount,
        });

        // Get upcoming pending/confirmed appointments
        const upcomingApts = aptRes.data
          .filter(a => new Date(a.date) >= new Date() && a.status !== 'CANCELLED')
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
          
        setAppointments(upcomingApts);
        
        // Recent reports (Activity log)
        const recentReps = repRes.data
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
          
        setReports(recentReps);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [user?.role]);

  let statCards = [];

  if (user?.role === 'PATIENT') {
    statCards = [
      { label: 'My Appointments', value: stats.appointmentsCount, icon: Calendar, color: 'text-blue-600', trend: '+1 New' },
      { label: 'My Records', value: stats.reportsCount, icon: FileText, color: 'text-emerald-600', trend: 'Up to date' },
      { label: 'Current Age', value: stats.age, icon: UserIcon, color: 'text-orange-600', trend: 'Years' },
      { label: 'Notifications', value: '2', icon: Bell, color: 'text-purple-600', trend: 'Unread' },
    ];
  } else if (user?.role === 'DOCTOR') {
    statCards = [
      { label: 'Total Patients', value: stats.patientsCount, icon: Users, color: 'text-blue-600', trend: 'Active' },
      { label: 'Appointments', value: stats.appointmentsCount, icon: Calendar, color: 'text-emerald-600', trend: 'Upcoming' },
      { label: 'Recent Prescriptions', value: stats.prescriptionsCount, icon: FileText, color: 'text-orange-600', trend: 'Issued' },
      { label: 'Activity Logs', value: stats.reportsCount, icon: Activity, color: 'text-purple-600', trend: 'Records' },
    ];
  } else if (user?.role === 'ADMIN') {
    statCards = [
      { label: 'Total Users', value: stats.patientsCount + stats.doctorsCount, icon: Users, color: 'text-blue-600', trend: 'Registered' },
      { label: 'Total Appointments', value: stats.appointmentsCount, icon: Calendar, color: 'text-emerald-600', trend: 'All Time' },
      { label: 'Total Reports', value: stats.reportsCount, icon: FileText, color: 'text-orange-600', trend: 'Generated' },
      { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-purple-600', trend: 'Collected' },
    ];
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-400"><Loader2 className="animate-spin mr-2" size={24} /> Loading Dashboard...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-400">Here is what is happening with your clinic today.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-blue-500/50 transition-all cursor-default shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl bg-slate-800/50 border border-white/5 ${stat.color.replace('600', '400')}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-medium text-emerald-400 flex items-center bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full whitespace-nowrap">
                {stat.trend} <ArrowUpRight size={12} className="ml-1" />
              </span>
            </div>
            <p className="text-sm font-medium text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-white mb-4">Upcoming Schedule</h3>
          {appointments.length === 0 ? (
            <div className="text-slate-500 text-sm py-8 text-center bg-slate-950/50 rounded-xl border border-white/5">No upcoming schedule.</div>
          ) : (
            <div className="space-y-3">
              {appointments.map(apt => (
                <div key={apt.id} className="flex justify-between items-center p-4 bg-slate-950/50 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                      {user?.role === 'PATIENT' ? apt.doctor?.user?.name?.charAt(0) : apt.patient?.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">
                        {user?.role === 'PATIENT' ? `Dr. ${apt.doctor?.user?.name}` : apt.patient?.user?.name}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {new Date(apt.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${apt.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-white mb-4">Recent Activity</h3>
          {reports.length === 0 ? (
            <div className="text-slate-500 text-sm py-8 text-center bg-slate-950/50 rounded-xl border border-white/5">No recent activity logs.</div>
          ) : (
            <div className="space-y-4">
              {reports.map((rep, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] shrink-0" />
                  <div>
                    <p className="font-medium text-slate-200">{rep.diagnosis}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(rep.date).toLocaleDateString()} • {user?.role === 'PATIENT' ? `Added by Dr. ${rep.doctor?.user?.name}` : `For ${rep.patient?.user?.name}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Ensure UserIcon is imported at top or locally defined since it's used for Current Age
function UserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}