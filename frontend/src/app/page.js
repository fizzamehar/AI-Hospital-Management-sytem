"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import Link from "next/link";
import { 
  Activity, Shield, Bot, Calendar, Users, 
  ArrowRight, Sparkles, Heart, Stethoscope, CheckCircle2 
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden selection:bg-blue-500/30">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">MedCore<span className="text-blue-500">+</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#benefits" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Benefits</a>
            <div className="h-4 w-px bg-white/10" />
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="bg-white text-slate-950 hover:bg-slate-100 text-sm font-bold py-2.5 px-6 rounded-full transition-all hover:scale-105 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-fadeIn">
            <Sparkles size={14} className="text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Next-Generation Healthcare Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            Manage your hospital with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-pulse">Intelligent Precision</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fadeIn" style={{ animationDelay: '200ms' }}>
            A unified system that brings together patients, doctors, and administrators. Powered by AI to streamline scheduling, diagnostics, and care.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn" style={{ animationDelay: '300ms' }}>
            <Link href="/register" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-full transition-all hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-semibold py-4 px-8 rounded-full transition-all flex items-center justify-center">
              View Demo
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-5xl mx-auto mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-fadeIn" style={{ animationDelay: '400ms' }}>
          {[
            { label: 'Active Facilities', value: '500+', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10' },
            { label: 'Patients Managed', value: '2M+', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'AI Diagnoses', value: '150K+', icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            { label: 'System Uptime', value: '99.99%', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/50 backdrop-blur-sm border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-slate-800/50 transition-colors">
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-6 border-t border-white/5 bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for Modern Healthcare</h2>
            <p className="text-lg text-slate-400">Everything you need to run your medical facility efficiently, securely, and intelligently.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: 'AI Medical Assistant',
                desc: 'Intelligent chatbot that triages patients, explains symptoms, and provides 24/7 preliminary guidance.',
                color: 'text-blue-400',
                bg: 'bg-blue-400/10'
              },
              {
                icon: Calendar,
                title: 'Automated Scheduling',
                desc: 'Smart calendar system that manages doctor availability, prevents conflicts, and sends automated reminders.',
                color: 'text-purple-400',
                bg: 'bg-purple-400/10'
              },
              {
                icon: Stethoscope,
                title: 'Digital Records',
                desc: 'Secure, comprehensive patient profiles with history, prescriptions, and lab results in one place.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-400/10'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                desc: 'Military-grade encryption and role-based access control (RBAC) powered by JWT authentication.',
                color: 'text-amber-400',
                bg: 'bg-amber-400/10'
              },
              {
                icon: Activity,
                title: 'Real-time Analytics',
                desc: 'Live dashboard providing insights into patient flow, revenue, and hospital performance metrics.',
                color: 'text-rose-400',
                bg: 'bg-rose-400/10'
              },
              {
                icon: Users,
                title: 'Dedicated Portals',
                desc: 'Customized interfaces for Administrators, Doctors, and Patients to ensure optimal workflow.',
                color: 'text-cyan-400',
                bg: 'bg-cyan-400/10'
              },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-900/80 border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-colors">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                  <feature.icon size={28} className={feature.color} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Decorative blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to upgrade your workflow?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join the growing network of modern healthcare facilities using MedCore+ to deliver exceptional care.
            </p>
            <Link href="/register" className="inline-flex bg-white text-slate-950 hover:bg-slate-100 font-bold py-4 px-10 rounded-full transition-transform hover:scale-105 items-center gap-2 text-lg">
              Create an Account
              <ArrowRight size={20} />
            </Link>
            
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> No credit card required</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> 14-day free trial</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-400"/> Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Activity size={24} className="text-blue-500" />
            <span className="text-xl font-bold text-white tracking-tight">MedCore+</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-400">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
          <p className="text-sm text-slate-500">© 2026 MedCore+ Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}