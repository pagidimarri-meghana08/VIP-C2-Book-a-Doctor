import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [profile,      setProfile]      = useState(null);
  const [activeTab,    setActiveTab]    = useState('pending');
  const [notes,        setNotes]        = useState({});
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/appointments/doctor-appointments'),
      API.get('/doctors/my-profile'),
    ]).then(([apptRes, profileRes]) => {
      setAppointments(apptRes.data.appointments);
      setProfile(profileRes.data.doctor);
    }).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status, note) => {
    try {
      await API.put(`/appointments/${id}/status`, { status, doctorNotes: note });
      setAppointments(prev => prev.map(a => a._id===id ? {...a, status, doctorNotes:note||a.doctorNotes} : a));
      toast.success(`Appointment ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const byStatus = (s) => appointments.filter(a => a.status === s);
  const tabs = ['pending','confirmed','completed','cancelled'];

  const statusBadge = s => {
    const map = {pending:'warning',confirmed:'success',completed:'secondary',cancelled:'danger',rejected:'danger'};
    return <span className={`badge bg-${map[s]||'secondary'}`}>{s}</span>;
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{color:'#0B6E6E'}}/></div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Doctor Dashboard</h3>
          <p className="text-muted mb-0">{profile?.specialty} · {profile?.hospital}</p>
        </div>
        <span className={`badge fs-6 ${profile?.approvalStatus==='approved'?'bg-success':'bg-warning text-dark'}`}>
          {profile?.approvalStatus}
        </span>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {label:'Pending',   val:byStatus('pending').length,   bg:'#FFF7ED', c:'#EA580C'},
          {label:'Confirmed', val:byStatus('confirmed').length, bg:'#ECFDF5', c:'#047857'},
          {label:'Completed', val:byStatus('completed').length, bg:'#EEF2FF', c:'#4F46E5'},
          {label:'Total',     val:appointments.length,          bg:'#D6EBE0', c:'#0B6E6E'},
        ].map(s => (
          <div className="col-6 col-md-3" key={s.label}>
            <div className="card border-0 p-3 text-center" style={{background:s.bg}}>
              <div className="fw-bold" style={{fontSize:26,color:s.c}}>{s.val}</div>
              <div className="small text-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex gap-3 border-bottom">
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="btn btn-sm fw-semibold text-capitalize"
              style={{color:activeTab===t?'#0B6E6E':'#9CA3AF', borderBottom:activeTab===t?'2px solid #0B6E6E':'2px solid transparent', borderRadius:0, paddingBottom:8}}>
              {t} ({byStatus(t).length})
            </button>
          ))}
        </div>
        <div className="card-body p-0">
          {byStatus(activeTab).length === 0 ? (
            <div className="text-center py-5 text-muted">No {activeTab} appointments.</div>
          ) : (
            byStatus(activeTab).map(a => (
              <div key={a._id} className="p-3 border-bottom">
                <div className="d-flex gap-3 align-items-start">
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                    style={{width:46,height:46,background:'#0B6E6E',fontSize:14}}>
                    {a.patient?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{a.patient?.name}</div>
                    <div className="small text-muted">{a.patient?.email}</div>
                    <div className="small mt-1">📅 {new Date(a.appointmentDate).toLocaleDateString()} at {a.timeSlot} · {a.visitType}</div>
                    {a.reason && <div className="small text-muted mt-1">Reason: {a.reason}</div>}
                    {a.documents?.length > 0 && <div className="small mt-1">📎 {a.documents.length} document(s) attached</div>}
                    {statusBadge(a.status)}

                    {/* Actions for pending */}
                    {a.status === 'pending' && (
                      <div className="d-flex gap-2 mt-2">
                        <button onClick={() => updateStatus(a._id,'confirmed')} className="btn btn-sm text-white fw-semibold" style={{background:'#047857',border:'none'}}>✓ Confirm</button>
                        <button onClick={() => updateStatus(a._id,'rejected')} className="btn btn-sm" style={{background:'#FDECEA',color:'#E8614A',border:'none'}}>✗ Reject</button>
                      </div>
                    )}

                    {/* Notes for confirmed */}
                    {a.status === 'confirmed' && (
                      <div className="mt-2">
                        <textarea className="form-control form-control-sm mb-2" rows={2}
                          placeholder="Add visit notes or prescription…"
                          value={notes[a._id] || ''} onChange={e => setNotes({...notes, [a._id]:e.target.value})} />
                        <button onClick={() => updateStatus(a._id,'completed',notes[a._id])} className="btn btn-sm text-white fw-semibold" style={{background:'#4F46E5',border:'none'}}>Mark Completed</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}