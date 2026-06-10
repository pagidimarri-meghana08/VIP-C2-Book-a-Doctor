import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments,   setAppointments]   = useState([]);
  const [notifications,  setNotifications]  = useState([]);
  const [activeTab,      setActiveTab]      = useState('upcoming');
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/appointments/my'),
      API.get('/users/notifications'),
    ]).then(([apptRes, notifRes]) => {
      setAppointments(apptRes.data.appointments);
      setNotifications(notifRes.data.notifications);
    }).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await API.put(`/appointments/${id}/cancel`);
      setAppointments(prev => prev.map(a => a._id === id ? {...a, status:'cancelled'} : a));
      toast.success('Appointment cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const upcoming  = appointments.filter(a => ['pending','confirmed'].includes(a.status));
  const past      = appointments.filter(a => ['completed','cancelled','rejected'].includes(a.status));
  const unread    = notifications.filter(n => !n.isRead).length;

  const statusBadge = (s) => {
    const map = { pending:'warning', confirmed:'success', completed:'secondary', cancelled:'danger', rejected:'danger' };
    return <span className={`badge bg-${map[s] || 'secondary'}`}>{s}</span>;
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color:'#0B6E6E' }}/></div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0">Good day, {user?.name} 👋</h3>
          <p className="text-muted mb-0">Manage your health appointments</p>
        </div>
        <Link to="/doctors" className="btn fw-semibold text-white" style={{ backgroundColor:'#0B6E6E' }}>
          + Book Appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {label:'Upcoming', val:upcoming.length, icon:'📅', bg:'#D6EBE0', c:'#0B6E6E'},
          {label:'Completed', val:past.filter(a=>a.status==='completed').length, icon:'✅', bg:'#EEF2FF', c:'#4F46E5'},
          {label:'Notifications', val:unread, icon:'🔔', bg:'#FDECEA', c:'#E8614A'},
        ].map(s => (
          <div className="col-md-4" key={s.label}>
            <div className="card border-0 p-3" style={{ background:s.bg }}>
              <div style={{ fontSize:28 }}>{s.icon}</div>
              <div className="fw-bold mt-2" style={{ fontSize:26, color:s.c }}>{s.val}</div>
              <div className="small text-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Appointments */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom d-flex gap-3">
              {['upcoming','past','notifications'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className="btn btn-sm fw-semibold text-capitalize"
                  style={{ color:activeTab===t?'#0B6E6E':'#9CA3AF', borderBottom:activeTab===t?'2px solid #0B6E6E':'2px solid transparent', borderRadius:0, paddingBottom:8 }}>
                  {t}
                </button>
              ))}
            </div>
            <div className="card-body p-0">
              {activeTab === 'upcoming' && (
                upcoming.length === 0
                  ? <div className="text-center py-5 text-muted"><div style={{fontSize:40}}>📅</div><p>No upcoming appointments.<br/><Link to="/doctors" style={{color:'#0B6E6E'}}>Book one now →</Link></p></div>
                  : upcoming.map(a => (
                    <div key={a._id} className="d-flex align-items-center gap-3 p-3 border-bottom">
                      <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                        style={{width:46,height:46,background:'#0B6E6E',fontSize:14}}>
                        {a.doctor?.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{a.doctor?.user?.name}</div>
                        <div className="small text-muted">{a.doctor?.specialty} · {new Date(a.appointmentDate).toLocaleDateString()} at {a.timeSlot}</div>
                        <div className="small mt-1">{statusBadge(a.status)} <span className="badge bg-light text-dark ms-1">{a.visitType}</span></div>
                      </div>
                      {a.status === 'pending' && (
                        <button onClick={() => handleCancel(a._id)} className="btn btn-sm" style={{background:'#FDECEA',color:'#E8614A',border:'none'}}>Cancel</button>
                      )}
                    </div>
                  ))
              )}

              {activeTab === 'past' && (
                past.length === 0
                  ? <div className="text-center py-5 text-muted">No past appointments.</div>
                  : past.map(a => (
                    <div key={a._id} className="d-flex align-items-center gap-3 p-3 border-bottom">
                      <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                        style={{width:46,height:46,background:'#8A97A8',fontSize:14}}>
                        {a.doctor?.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{a.doctor?.user?.name}</div>
                        <div className="small text-muted">{a.doctor?.specialty} · {new Date(a.appointmentDate).toLocaleDateString()}</div>
                        {a.doctorNotes && <div className="small mt-1 text-muted">📝 {a.doctorNotes}</div>}
                      </div>
                      {statusBadge(a.status)}
                    </div>
                  ))
              )}

              {activeTab === 'notifications' && (
                notifications.length === 0
                  ? <div className="text-center py-5 text-muted">No notifications.</div>
                  : notifications.map(n => (
                    <div key={n._id} className={`d-flex gap-3 p-3 border-bottom ${!n.isRead?'bg-light':''}`}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:n.isRead?'#E5E7EB':'#E8614A',marginTop:6,flexShrink:0}} />
                      <div>
                        <div className="small">{n.message}</div>
                        <div className="small text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-3 mb-3">
            <h6 className="fw-bold mb-3">Quick Actions</h6>
            <Link to="/doctors"      className="btn w-100 mb-2 text-white fw-semibold" style={{backgroundColor:'#0B6E6E'}}>🔍 Find Doctors</Link>
            <Link to="/apply-doctor" className="btn w-100 mb-2 btn-outline-secondary fw-semibold">👨‍⚕️ Apply as Doctor</Link>
            <Link to="/profile"      className="btn w-100 btn-outline-secondary fw-semibold">👤 Edit Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}