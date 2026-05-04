"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { User, Mail, Phone, MapPin, Briefcase, Award, Loader2, Save, AlertCircle } from "lucide-react";
import { getUser, setToken } from "@/lib/auth";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    password: "",
    // Patient specific
    address: "",
    age: "",
    // Doctor specific
    specialization: "",
    experience: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/profile");
      const data = res.data;
      setUser(data);
      
      setFormData({
        name: data.name || "",
        email: data.email || "",
        contact: data.contact || "",
        password: "",
        address: data.patient?.address || "",
        age: data.patient?.age || "",
        specialization: data.doctor?.specialization || "",
        experience: data.doctor?.experience || ""
      });
    } catch(err) {
      console.error(err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        ...(formData.password && { password: formData.password })
      };
      
      if (user?.role === "PATIENT") {
        payload.patientDetails = {
          address: formData.address,
          age: formData.age
        };
      } else if (user?.role === "DOCTOR") {
        payload.doctorDetails = {
          specialization: formData.specialization,
          experience: formData.experience
        };
      }

      await API.put("/auth/profile", payload);
      setSuccess("Profile updated successfully!");
      fetchProfile();
    } catch(err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Profile Settings</h1>
        <p className="text-slate-400 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
          <div className="w-24 h-24 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-4xl font-bold shadow-inner">
            {formData.name.charAt(0) || <User size={40} />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{formData.name || "User"}</h2>
            <p className="text-slate-400 font-medium uppercase text-sm tracking-wider">{user?.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400">
              <AlertCircle size={20} /> <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
              <AlertCircle size={20} /> <p>{success}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email" required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1">Contact Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="tel"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                  value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1">New Password</label>
              <div className="relative">
                <input 
                  type="password" placeholder="Leave blank to keep current"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          </div>

          {user?.role === "PATIENT" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5 mt-6">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                    value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Age</label>
                <input 
                  type="number"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                  value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
            </div>
          )}

          {user?.role === "DOCTOR" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5 mt-6">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Specialization</label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" required
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                    value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Years of Experience</label>
                <div className="relative">
                  <Award size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="number"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                    value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button 
              type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 font-medium flex items-center gap-2"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
