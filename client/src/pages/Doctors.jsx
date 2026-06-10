import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../utils/api';

const SPECIALTIES = ['All','Cardiology','Neurology','Orthopedics','Pediatrics','Dermatology','Psychiatry','Ophthalmology','Dentistry'];

export default function Doctors() {
  const [doctors, setDoctors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search,  setSearch]    = useState('');
  const [searchParams]          = useSearchParams();
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || 'All');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const params = {};
        if (specialty !== 'All') params.specialty = specialty;
        if (search) params.search = search;
        const { data } = await API.get('/doctors', { params });
        setDoctors(data.doctors);
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [specialty, search]);

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-1">Find a Doctor</h2>
      <p className="text-muted mb-4">Search from our verified network of specialists</p>

      {/* Search + filter */}
      <div className="row g-2 mb-4">
        <div className="col-md-5">
          <input className="form-control" placeholder="Search name or specialty…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="col-md-7 d-flex flex-wrap gap-2">
          {SPECIALTIES.map(s => (
            <button key={s} onClick={() => setSpecialty(s)}
              className={`btn btn-sm ${specialty === s ? 'text-white' : 'btn-outline-secondary'}`}
              style={specialty === s ? { background: '#0B6E6E', borderColor: '#0B6E6E' } : {}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: '#0B6E6E' }} /></div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 48 }}>🔍</div>
          <p className="mt-2">No doctors found. Try a different filter.</p>
        </div>
      ) : (
        <div className="row g-4">
          {doctors.map(doctor => (
            <div className="col-md-4" key={doctor._id}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex gap-3 align-items-start mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                      style={{ width: 52, height: 52, background: '#0B6E6E', fontSize: 18 }}>
                      {doctor.user?.name?.split(' ').map(w => w[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0">{doctor.user?.name}</h6>
                      <small className="fw-semibold" style={{ color: '#0B6E6E' }}>{doctor.specialty}</small>
                      <div className="text-warning small mt-1">{'★'.repeat(Math.round(doctor.rating || 4))} <span className="text-muted">{doctor.rating || '4.8'}</span></div>
                    </div>
                  </div>
                  <div className="small text-muted mb-1">📍 {doctor.location}</div>
                  <div className="small text-muted mb-1">🏥 {doctor.hospital}</div>
                  <div className="small text-muted mb-1">⏱ {doctor.experience} yrs experience</div>
                  <div className="small fw-semibold mb-3" style={{ color: '#E8614A' }}>💰 ₹{doctor.consultationFee}</div>
                  <Link to={`/book/${doctor._id}`} className="btn w-100 text-white fw-semibold"
                    style={{ backgroundColor: '#0B6E6E' }}>
                    Book Appointment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}