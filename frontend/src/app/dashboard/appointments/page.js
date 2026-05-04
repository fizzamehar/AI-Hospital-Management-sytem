"use client";
import { useState, useEffect } from 'react';
import API from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Stethoscope, Plus, X, Loader2, Calendar as CalendarIcon, Clock, Edit2, Trash2, AlertCircle } from 'lucide-react';

export default function AppointmentsPage() {
  const user = getUser();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', doctorId: '', symptoms: '', date: '', status: 'PENDING' });
  const [completeData, setCompleteData] = useState({ id: '', notes: '', medicines: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const docRes = await API.get('/doctors'); 
      setDoctors(docRes.data);
      
      const aptRes = await API.get('/appointments');
      setAppointments(aptRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (apt = null) => {
    setError("");
    if (apt) {
      setIsEditing(true);
      setFormData({ 
        id: apt.id, 
        doctorId: apt.doctorId || '', 
        symptoms: apt.symptoms || '',
        date: apt.date ? new Date(apt.date).toISOString().slice(0, 16) : '',
        status: apt.status || 'PENDING'
      });
    } else {
      setIsEditing(false);
      setFormData({ id: '', doctorId: '', symptoms: '', date: '', status: 'PENDING' });
    }
    setShowModal(true);
  };

  const deleteAppointment = async (id) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await API.delete(`/appointments/${id}`);
        fetchData();
      } catch (err) {
        alert("Failed to cancel appointment");
      }
    }
  };

  const openCompleteModal = (apt) => {
    setError("");
    setCompleteData({ 
      id: apt.id, 
      notes: '', 
      medicines: '',
      patientName: apt.patient?.user?.name || 'Unknown Patient',
      symptoms: apt.symptoms || 'No symptoms provided'
    });
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");

    try {
      await API.post(`/appointments/${completeData.id}/complete`, {
        notes: completeData.notes,
        medicines: completeData.medicines,
      });
      setShowCompleteModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete appointment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError("");
    
    try {
      const payload = { 
        doctorId: formData.doctorId, 
        symptoms: formData.symptoms,
        ...(formData.date && { date: new Date(formData.date).toISOString() }),
        ...(isEditing && user?.role !== 'PATIENT' && { status: formData.status })
      };

      if (isEditing) {
        await API.patch(`/appointments/${formData.id}`, payload);
      } else {
        await API.post('/appointments', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'CONFIRMED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'CANCELLED': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Appointments</h1>
          <p className="text-slate-400 mt-1">Manage and schedule your consultations.</p>
        </div>
        {user?.role === 'PATIENT' && (
          <button 
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} /> Book Appointment
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading appointments...</div>
      ) : (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 text-slate-400">
              No scheduled appointments found.
            </div>
          ) : (
            appointments.map((apt) => (
              <div key={apt.id} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-blue-500/50 transition-all shadow-lg group">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                    <Stethoscope size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                      {user?.role === 'PATIENT' ? `Dr. ${apt.doctor?.user?.name || 'Specialist'}` : apt.patient?.user?.name || 'Patient'}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{apt.symptoms}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                        <CalendarIcon size={14} className="text-blue-400" />
                        {new Date(apt.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                        <Clock size={14} className="text-blue-400" />
                        {new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(apt.status)} whitespace-nowrap`}>
                    {apt.status}
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                    {user?.role === 'DOCTOR' && apt.status !== 'COMPLETED' && (
                      <button
                        onClick={() => openCompleteModal(apt)}
                        className="flex-1 sm:flex-none text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Stethoscope size={16} /> Complete
                      </button>
                    )}
                    <button
                      onClick={() => openModal(apt)}
                      className="flex-1 sm:flex-none text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => deleteAppointment(apt.id)}
                      className="flex-1 sm:flex-none text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Cancel
                    </button>
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
              <h2 className="text-xl font-bold text-white">
                {isEditing ? "Update Appointment" : "Schedule Consultation"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
                  <AlertCircle size={16} /> <p>{error}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Select Doctor <span className="text-rose-500">*</span></label>
                <select 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  value={formData.doctorId}
                  onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                  required
                >
                  <option value="" className="bg-slate-900">-- Choose a Doctor --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id} className="bg-slate-900">
                      Dr. {doc.user?.name || "Specialist"} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {isEditing && (
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Date & Time</label>
                  <input 
                    type="datetime-local"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              )}

              {isEditing && user?.role !== 'PATIENT' && (
                <div>
                  <label className="text-sm font-medium text-slate-300 block mb-1">Status</label>
                  <select 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="PENDING" className="bg-slate-900">Pending</option>
                    <option value="CONFIRMED" className="bg-slate-900">Confirmed</option>
                    <option value="COMPLETED" className="bg-slate-900">Completed</option>
                    <option value="CANCELLED" className="bg-slate-900">Cancelled</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Symptoms</label>
                <textarea 
                  placeholder="Describe your symptoms..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  required
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
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? "Update" : "Confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Appointment Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Stethoscope size={20} className="text-emerald-400" /> Complete Appointment
              </h2>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-sm">
                  <AlertCircle size={16} /> <p>{error}</p>
                </div>
              )}

              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-2 mb-4">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Patient Name</span>
                  <p className="text-white font-medium">{completeData.patientName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Symptoms</span>
                  <p className="text-slate-300 text-sm mt-0.5">{completeData.symptoms}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Diagnosis / Notes</label>
                <textarea 
                  placeholder="Enter diagnosis..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                  value={completeData.notes}
                  onChange={(e) => setCompleteData({...completeData, notes: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Medicines & Dosage</label>
                <textarea 
                  placeholder="e.g., Paracetamol 500mg - 1x/day"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none"
                  value={completeData.medicines}
                  onChange={(e) => setCompleteData({...completeData, medicines: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-white/5 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white px-6 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : "Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}