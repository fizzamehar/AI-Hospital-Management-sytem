"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { FileText, Plus, X, Loader2, Stethoscope, User, AlertCircle, Download, UploadCloud } from "lucide-react";
import { getUser } from "@/lib/auth";

export default function MedicalRecords() {
  const [data, setData] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const user = getUser();
  
  const [formData, setFormData] = useState({
    patientId: "",
    diagnosis: "",
    treatment: "",
    documentUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/medical-records");
      setData(res.data);
      
      if (user?.role === 'DOCTOR' || user?.role === 'ADMIN') {
        const patRes = await API.get("/patients");
        setPatients(patRes.data);
      }
    } catch(err) {
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
    setFormData({ patientId: "", diagnosis: "", treatment: "", documentUrl: "" });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    
    try {
      let finalDocUrl = formData.documentUrl;

      if (selectedFile) {
        const fileData = new FormData();
        fileData.append("file", selectedFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: fileData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          finalDocUrl = uploadData.fileUrl;
        } else {
          throw new Error("File upload failed");
        }
      }

      await API.post("/medical-records", {
        patientId: formData.patientId,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        doctorId: user?.id, 
        documentUrl: finalDocUrl,
      });
      setShowModal(false);
      fetchData();
    } catch(err) {
      setError(err.response?.data?.message || err.message || "Failed to save record.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Medical Reports</h1>
          <p className="text-slate-400 mt-1">View and manage patient diagnosis, treatments, and lab reports.</p>
        </div>
        {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
          <button 
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} /> Add Report
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading reports...</div>
      ) : (
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 text-slate-400">
              No medical reports found.
            </div>
          ) : (
            data.map((r) => (
              <div key={r.id} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-blue-500/50 transition-all shadow-lg group">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 flex items-start gap-4 mb-4 border-b md:border-b-0 border-white/5 pb-4 md:pb-0">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start">
                        <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors">
                          {r.diagnosis}
                        </h3>
                        <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 mt-2 sm:mt-0">
                          {new Date(r.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-3 p-3 bg-slate-950/50 border border-white/5 rounded-xl">
                        <p className="text-slate-300 text-sm whitespace-pre-line">{r.treatment}</p>
                      </div>
                    </div>
                  </div>
                  
                  {r.documentUrl && (
                    <div className="md:pl-6 md:border-l border-white/5 flex flex-col justify-center shrink-0">
                      <a 
                        href={r.documentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl transition-all font-medium text-sm w-full justify-center"
                      >
                        <Download size={16} /> View Lab Report
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5 mt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <User size={16} className="text-slate-500" /> 
                    Patient: <span className="font-medium text-slate-200">{r.patient?.user?.name || r.patientId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <Stethoscope size={16} className="text-slate-500" /> 
                    Doctor: <span className="font-medium text-slate-200">{r.doctor?.user?.name || r.doctorId}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">New Medical Report</h2>
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
              
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Select Patient <span className="text-rose-500">*</span></label>
                <select 
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="" className="bg-slate-900">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.user?.name || `Patient #${p.id.slice(0,4)}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Diagnosis <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Acute Bronchitis"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Treatment Plan / Notes <span className="text-rose-500">*</span></label>
                <textarea 
                  required
                  placeholder="Details about the treatment..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  value={formData.treatment}
                  onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Lab Report (PDF/Image)</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-slate-950/50 border border-dashed border-white/20 hover:border-blue-500/50 rounded-xl px-4 py-6 cursor-pointer transition-all">
                    <UploadCloud size={20} className="text-slate-400" />
                    <span className="text-slate-300 text-sm font-medium">
                      {selectedFile ? selectedFile.name : "Click to upload file"}
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                  </label>
                </div>
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
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : "Save Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}