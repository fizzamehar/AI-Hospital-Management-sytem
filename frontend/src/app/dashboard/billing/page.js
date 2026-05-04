"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { getUser } from "@/lib/auth";
import { CreditCard, DollarSign, CheckCircle2, Clock, Plus, X, Loader2, AlertCircle } from "lucide-react";

export default function Billing() {
  const [data, setData] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const isAdmin = user?.role === 'ADMIN';

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ patientId: "", amount: "", status: "UNPAID" });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/billing");
      setData(res.data);
      
      if (isAdmin) {
        const patRes = await API.get("/patients");
        setPatients(patRes.data);
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
    setFormData({ patientId: "", amount: "", status: "UNPAID" });
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    
    try {
      await API.post("/billing", {
        patientId: formData.patientId,
        amount: parseFloat(formData.amount),
        status: formData.status
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create invoice.");
    } finally {
      setActionLoading(false);
    }
  };

  const markAsPaid = async (id) => {
    try {
      await API.patch(`/billing/${id}`, { status: "PAID" });
      fetchData();
    } catch (err) {
      alert("Failed to update payment status.");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Billing & Invoices</h1>
          <p className="text-slate-400 mt-1">Manage hospital invoices and track payments.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} /> Create Invoice
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading invoices...</div>
      ) : (
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 text-slate-400">
              No invoices found.
            </div>
          ) : (
            data.map((b) => (
              <div key={b.id} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-500/50 transition-all shadow-lg group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">
                      Invoice #{b.id.substring(0,8).toUpperCase()}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Patient: <span className="font-medium text-slate-300">{b.patient?.user?.name || 'Unknown'}</span>
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 inline-flex">
                      Date: {new Date(b.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-black text-white flex items-center">
                      <DollarSign size={20} className="text-slate-400 mr-1" />
                      {b.amount.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                      b.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {b.status === 'PAID' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                      {b.status}
                    </div>
                    
                    {isAdmin && b.status !== 'PAID' && (
                      <button 
                        onClick={() => markAsPaid(b.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
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
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Create Invoice</h2>
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
                <label className="block text-sm font-medium text-slate-300 mb-1">Select Patient <span className="text-rose-500">*</span></label>
                <select 
                  required
                  value={formData.patientId}
                  onChange={e => setFormData({...formData, patientId: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="" className="bg-slate-900">-- Choose a Patient --</option>
                  {patients.map((pat) => (
                    <option key={pat.id} value={pat.id} className="bg-slate-900">
                      {pat.user?.name || `Patient #${pat.id.slice(0,4)}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Amount ($) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 150.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="UNPAID" className="bg-slate-900">Unpaid</option>
                  <option value="PAID" className="bg-slate-900">Paid</option>
                </select>
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
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}