"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Users, Activity, Phone, Trash2, Mail, Plus, Edit2, X, AlertCircle } from "lucide-react";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", address: "", age: "" });
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/patients");
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const deletePatient = async (id) => {
    if (confirm("Are you sure you want to delete this patient profile?")) {
      try {
        await API.delete(`/patients/${id}`);
        fetchData();
      } catch (err) {
        alert("Failed to delete patient");
      }
    }
  };

  const openModal = (patient = null) => {
    setError("");
    if (patient) {
      setIsEditing(true);
      setFormData({ id: patient.id, address: patient.address || "", age: patient.age || "" });
    } else {
      setIsEditing(false);
      setFormData({ id: "", address: "", age: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    
    try {
      const payload = { 
        address: formData.address, 
        age: formData.age ? parseInt(formData.age) : null 
      };
      
      if (isEditing) {
        await API.patch(`/patients/${formData.id}`, payload);
      } else {
        await API.post("/patients", payload);
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
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Patient Records</h1>
          <p className="text-slate-400 mt-1">Manage and view all registered patients.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} /> Add Patient Record
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading patients...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {patients.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 text-slate-400">
              No patients found.
            </div>
          ) : (
            patients.map((p) => (
              <div key={p.id} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-500/50 transition-all shadow-lg group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                      {p.user?.name || `Patient #${p.id.slice(0,6)}`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      {p.user?.email && (
                        <p className="text-slate-400 text-sm flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          <Mail size={12} /> {p.user.email}
                        </p>
                      )}
                      {p.user?.contact && (
                        <p className="text-slate-400 text-sm flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          <Phone size={12} /> {p.user.contact}
                        </p>
                      )}
                      {p.age && (
                        <p className="text-slate-400 text-sm flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          Age: {p.age}
                        </p>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-3 flex items-center gap-1">
                      <Activity size={12} /> Registered: {new Date(p.user?.createdAt || p.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openModal(p)}
                    className="flex-1 sm:flex-none text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => deletePatient(p.id)}
                    className="flex-1 sm:flex-none text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "Edit Patient Record" : "Add Patient Record"}
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 45"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                <textarea 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                  placeholder="Patient residential address"
                />
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
                  {actionLoading ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}