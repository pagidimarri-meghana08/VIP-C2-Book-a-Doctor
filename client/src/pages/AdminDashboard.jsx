import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

export default function AdminDashboard() {
  const [stats,        setStats]       = useState({});
  const [pending,      setPending]     = useState([]);
  const [users,        setUsers]       = useState([]);
  const [appointments, setAppointments]= useState([]);
  const [activeTab,    setActiveTab]   = useState('overview');
  const [loading,      setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/admin/dashboard'),
      API.get('/admin/doctors/pending'),
      API.get('/admin/users'),
      API.get('/admin/appointments'),
    ]).then(([statsRes, pendingRes, usersRes, apptRes]) => {
      setStats(statsRes.data.stats);
      setPending(pendingRes.data.doctors);
      setUsers(usersRes.data.users);
      setAppointments(apptRes.data.appointments);
    }).finally(() => setLoading(false));
  }, []);

  const approveDoctor = async (id) => {
    try {
      await API.put(`/admin/doctors/${id}/approve`);
      setPending(prev => prev.filter(d => d._id !== id));
      setStats(s => ({...s, totalDoctors:(s.totalDoctors||0)+1, pendingDoctors:(s.pendingDoctors||1)-1}));
      toast.success('Doctor approved!');
    } catch { toast.error('Failed to approve'); }
  };

  const rejectDoctor = async (id) => {
    try {
      await API.put(`/admin/doctors/${id}/reject`);
      setPending(prev => prev.filter(d => d._id !== id));
      setStats(s => ({...s, pendingDoctors:(s.pendingDoctors||1)-1}));
      toast.info('Application rejected');
    } catch { toast.error('Failed to reject'); }
  };

  const toggleUser = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id===id ? {...u, isActive:data.user.isActive} : u));
      toast.success(`User ${data.user.isActive?'activated':'deactivated'}`);
    } catch { toast.error('Failed'); }
  };

  const statusBadge = s => {
    const map = {pending:'warning',confirmed:'success',completed:'secondary',cancelled:'danger',rejected:'danger'};
    return <span className={`badge bg-${map[s]||'secondary'}`}>{s}</span>;
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{color:'#0B6E6E'}}/></div>;

  return (
    <div className="container-fluid py-4 px-4">
      <h3 className="fw-bold mb-1">Admin Dashboard</h3>
      <p className="text-muted mb-4">Platform management and oversight</p>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {label:'Total Patients',   val:stats.totalUsers,          bg:'#D6EBE0', c:'#0B6E6E',  icon:'👥'},
          {label:'Active Doctors',   val:stats.totalDoctors,        bg:'#EEF2FF', c:'#4F46E5',  icon:'👨‍⚕️'},
          {label:'Pending Approval', val:stats.pendingDoctors,      bg:'#FFF7ED', c:'#EA580C',  icon:'⏳'},
          {label:'Total Appointments',val:stats.totalAppointments,  bg:'#FDECEA', c:'#E8614A',  icon:'📅'},
          {label:'Completed Visits', val:stats.completedAppointments,bg:'#ECFDF5',c:'#047857', icon:'✅'},
        ].map(s => (
          <div className="col-6 col-md-2" key={s.label}>
            <div className="card border-0 p-3 text-center" style={{background:s.bg}}>
              <div style={{fontSize:26}}>{s.icon}</div>
              <div className="fw-bold mt-1" style={{fontSize:24,color:s.c}}>{s.val ?? 0}</div>
              <div className="small text-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="d-flex gap-3 mb-3 border-bottom">
        {['overview','pending doctors','users','appointments'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="btn btn-sm fw-semibold text-capitalize pb-2"
            style={{color:activeTab===t?'#0B6E6E':'#9CA3AF', borderBottom:activeTab===t?'2px solid #0B6E6E':'2px solid transparent', borderRadius:0}}>
            {t} {t==='pending doctors'&&pending.length>0&&<span className="badge bg-warning text-dark ms-1">{pending.length}</span>}
          </button>
        ))}
      </div>

      {/* Pending doctors */}
      {activeTab === 'pending doctors' && (
        pending.length === 0
          ? <div className="text-center py-5 text-muted"><div style={{fontSize:40}}>✅</div><p>No pending applications.</p></div>
          : <div className="row g-3">
              {pending.map(d => (
                <div className="col-md-6" key={d._id}>
                  <div className="card border-0 shadow-sm p-3">
                    <div className="d-flex gap-3 mb-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                        style={{width:48,height:48,background:'#0B6E6E',fontSize:14}}>
                        {d.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <div className="fw-bold">{d.user?.name}</div>
                        <div className="small" style={{color:'#0B6E6E'}}>{d.specialty}</div>
                        <div className="small text-muted">{d.user?.email}</div>
                      </div>
                    </div>
                    <div className="row g-1 small text-muted mb-3">
                      <div className="col-6">🏥 {d.hospital}</div>
                      <div className="col-6">⏱ {d.experience} yrs</div>
                      <div className="col-6">📍 {d.location}</div>
                      <div className="col-6">🎓 {d.qualifications}</div>
                    </div>
                    {d.bio && <p className="small text-muted mb-3">{d.bio}</p>}
                    <div className="d-flex gap-2">
                      <button onClick={() => approveDoctor(d._id)} className="btn flex-fill btn-sm fw-semibold text-white" style={{background:'#047857',border:'none'}}>✓ Approve</button>
                      <button onClick={() => rejectDoctor(d._id)}  className="btn flex-fill btn-sm fw-semibold" style={{background:'#FDECEA',color:'#E8614A',border:'none'}}>✗ Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td className="fw-semibold">{u.name}</td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className="badge bg-light text-dark">{u.role}</span></td>
                  <td><span className={`badge ${u.isActive?'bg-success':'bg-secondary'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                  <td className="text-muted small">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><button onClick={() => toggleUser(u._id)} className={`btn btn-sm ${u.isActive?'btn-outline-danger':'btn-outline-success'}`}>{u.isActive?'Deactivate':'Activate'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Appointments */}
      {(activeTab === 'appointments' || activeTab === 'overview') && (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th></tr>
            </thead>
            <tbody>
              {appointments.slice(0, activeTab==='overview'?5:undefined).map(a => (
                <tr key={a._id}>
                  <td className="fw-semibold">{a.patient?.name}</td>
                  <td>{a.doctor?.user?.name}</td>
                  <td className="text-muted small">{new Date(a.appointmentDate).toLocaleDateString()}</td>
                  <td className="text-muted small">{a.timeSlot}</td>
                  <td><span className="badge bg-light text-dark">{a.visitType}</span></td>
                  <td>{statusBadge(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}