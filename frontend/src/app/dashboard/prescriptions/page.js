"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { getUser } from "@/lib/auth";
import { FileText, Plus, X, Loader2, AlertCircle, User, Stethoscope } from "lucide-react";

export default function Prescriptions() {
  const [data, setData] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const isAdmin = user?.role === 'ADMIN';
  const isDoctor = user?.role === 'DOCTOR';

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ doctorId: "", patientId: "", notes: "", medicines: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/prescriptions");
      setData(res.data);
      
      if (isAdmin || isDoctor) {
        const patRes = await API.get("/patients");
        setPatients(patRes.data);
        
        const docRes = await API.get("/doctors");
        setDoctors(docRes.data);
        
        // Auto-select doctor if the logged-in user is a doctor
        if (isDoctor) {
          const myDocProfile = docRes.data.find(d => d.userId === user.id);
          if (myDocProfile) {
            setFormData(prev => ({ ...prev, doctorId: myDocProfile.id }));
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    setError("");
    setFormData(prev => ({ ...prev, patientId: "", notes: "", medicines: "" }));
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    
    try {
      await API.post("/prescriptions", {
        doctorId: formData.doctorId,
        patientId: formData.patientId,
        notes: formData.notes,
        medicines: formData.medicines
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add prescription.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Prescriptions</h1>
          <p className="text-slate-400 mt-1">Medical prescriptions and dosage details.</p>
        </div>
        {(isAdmin || isDoctor) && (
          <button 
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} /> Add Prescription
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading prescriptions...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 text-slate-400">
              No prescriptions found.
            </div>
          ) : (
            data.map((p) => (
              <div key={p.id} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col gap-4 hover:border-blue-500/50 transition-all shadow-lg group">
                <div className="flex items-start gap-4 border-b border-white/5 pb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      <User size={16} className="text-slate-500" /> 
                      {p.patient?.user?.name || `Patient #${p.patientId?.slice(0,4)}`}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                      <Stethoscope size={16} className="text-slate-500" />
                      Dr. {p.doctor?.user?.name || `Doctor #${p.doctorId?.slice(0,4)}`}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-2">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Diagnosis / Notes</p>
                    <p className="text-slate-300 text-sm bg-slate-950/50 p-3 rounded-xl border border-white/5 min-h-[80px]">
                      {p.notes || "No additional notes provided."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Medicines</p>
                    <p className="text-blue-200 text-sm bg-blue-500/5 p-3 rounded-xl border border-blue-500/10 min-h-[80px] font-medium whitespace-pre-line">
                      {p.medicines || "No medicines listed."}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Add Prescription</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
                  <AlertCircle size={16} /> <p>{error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Doctor <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      value={formData.doctorId}
                      onChange={e => setFormData({...formData, doctorId: e.target.value})}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="" className="bg-slate-900">-- Select Doctor --</option>
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id} className="bg-slate-900">
                          Dr. {doc.user?.name || `Doc #${doc.id.slice(0,4)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className={isAdmin ? "" : "md:col-span-2"}>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Patient <span className="text-rose-500">*</span></label>
                  <select 
                    required
                    value={formData.patientId}
                    onChange={e => setFormData({...formData, patientId: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="" className="bg-slate-900">-- Select Patient --</option>
                    {patients.map((pat) => (
                      <option key={pat.id} value={pat.id} className="bg-slate-900">
                        {pat.user?.name || `Patient #${pat.id.slice(0,4)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Diagnosis / Notes</label>
                <textarea 
                  required
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Enter diagnosis or doctor's notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Medicines & Dosage</label>
                <textarea 
                  required
                  value={formData.medicines}
                  onChange={e => setFormData({...formData, medicines: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                  placeholder="1. Paracetamol 500mg - 1 tab (Morning/Night)&#10;2. Amoxicillin 250mg - 1 cap (After food)"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : "Save Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}