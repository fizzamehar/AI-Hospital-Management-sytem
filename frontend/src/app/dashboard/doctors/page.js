"use client";
import { useState, useEffect } from 'react';
import API from '@/lib/api';
import { Stethoscope, Star, Mail, Phone, Plus, Edit2, Trash2, X, AlertCircle, Calendar } from 'lucide-react';
import { getUser } from '@/lib/auth';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", specialization: "", experience: "", available: true });
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.log("Catching error to prevent crash:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (doc = null) => {
    setError("");
    if (doc) {
      setIsEditing(true);
      setFormData({ 
        id: doc.id, 
        specialization: doc.specialization || "", 
        experience: doc.experience || "",
        available: doc.available ?? true
      });
    } else {
      setIsEditing(false);
      setFormData({ id: "", specialization: "", experience: "", available: true });
    }
    setIsModalOpen(true);
  };

  const deleteDoctor = async (id) => {
    if (confirm("Are you sure you want to remove this doctor profile?")) {
      try {
        await API.delete(`/doctors/${id}`);
        fetchData();
      } catch (err) {
        alert("Failed to delete doctor");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    
    try {
      const payload = { 
        specialization: formData.specialization, 
        experience: formData.experience ? parseInt(formData.experience) : null,
        available: formData.available
      };
      
      if (isEditing) {
        await API.patch(`/doctors/${formData.id}`, payload);
      } else {
        await API.post("/doctors", payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Medical Specialists</h1>
          <p className="text-slate-400 mt-1">View and manage hospital staff and their availability.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} /> Add Doctor
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading specialists...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {doctors.length > 0 ? doctors.map((doc) => (
            <div key={doc.id} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all flex flex-col">
              <div className={`h-2 w-full ${doc.available ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl shadow-inner">
                      {doc.user?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                        Dr. {doc.user?.name || `Doctor #${doc.id.slice(0,4)}`}
                      </h3>
                      <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mt-1 bg-blue-500/10 inline-block px-2 py-0.5 rounded-md border border-blue-500/20">
                        {doc.specialization || 'General Physician'}
                      </p>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => openModal(doc)} className="text-slate-400 hover:text-blue-400 transition-colors p-1 bg-white/5 rounded-lg border border-white/5">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteDoctor(doc.id)} className="text-slate-400 hover:text-rose-400 transition-colors p-1 bg-white/5 rounded-lg border border-white/5">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 mb-6 flex-1">
                  {doc.user?.email && (
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                        <Mail size={14} />
                      </div>
                      {doc.user.email}
                    </div>
                  )}
                  {doc.user?.contact && (
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                        <Phone size={14} />
                      </div>
                      {doc.user.contact}
                    </div>
                  )}
                  {doc.experience && (
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                      </div>
                      {doc.experience} Years Experience
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
                      <Calendar size={14} className={doc.available ? "text-emerald-400" : "text-rose-400"} />
                    </div>
                    Status: <span className={doc.available ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {doc.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>

                <button className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-blue-600 hover:border-blue-500 transition-colors shadow-lg mt-auto">
                  View Schedule
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 text-slate-400">
              No doctors found in the database.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "Edit Doctor Profile" : "Add Doctor Profile"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
                  <AlertCircle size={16} /> <p>{error}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Specialization <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={formData.specialization}
                  onChange={e => setFormData({...formData, specialization: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Cardiologist"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Years of Experience</label>
                <input 
                  type="number" 
                  value={formData.experience}
                  onChange={e => setFormData({...formData, experience: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 10"
                />
              </div>

              <div className="flex items-center gap-3 mt-4 bg-slate-950/50 p-4 border border-white/10 rounded-xl">
                <input 
                  type="checkbox" 
                  id="available"
                  checked={formData.available}
                  onChange={e => setFormData({...formData, available: e.target.checked})}
                  className="w-5 h-5 rounded border-white/10 text-blue-600 focus:ring-blue-500 bg-slate-900"
                />
                <label htmlFor="available" className="text-sm font-medium text-slate-300 cursor-pointer flex-1">
                  Currently Available for Appointments
                </label>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  {actionLoading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}