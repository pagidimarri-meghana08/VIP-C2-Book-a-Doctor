import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../utils/api';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function ApplyDoctor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    specialty:'', qualifications:'', experience:'', consultationFee:'',
    hospital:'', location:'', bio:'',
  });
  const [slots, setSlots]   = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});

  const toggleDay = (day) => {
    setSlots(prev =>
      prev.find(s => s.day===day)
        ? prev.filter(s => s.day!==day)
        : [...prev, {day, startTime:'09:00', endTime:'17:00'}]
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/doctors/apply', {...form, availableSlots: slots});
      toast.success('Application submitted! Waiting for admin approval.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{maxWidth:640}}>
      <h3 className="fw-bold mb-1">Apply as a Doctor</h3>
      <p className="text-muted mb-4">Fill in your professional details — our admin team will review and approve your application.</p>

      <form onSubmit={handleSubmit} className="card border-0 shadow-sm p-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Specialty *</label>
            <input name="specialty" className="form-control" placeholder="e.g. Cardiologist" value={form.specialty} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Qualifications</label>
            <input name="qualifications" className="form-control" placeholder="e.g. MBBS, MD" value={form.qualifications} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Experience (years)</label>
            <input name="experience" type="number" className="form-control" min="0" value={form.experience} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Consultation Fee (₹)</label>
            <input name="consultationFee" type="number" className="form-control" min="0" value={form.consultationFee} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Hospital / Clinic</label>
            <input name="hospital" className="form-control" placeholder="Hospital name" value={form.hospital} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Location</label>
            <input name="location" className="form-control" placeholder="City, Area" value={form.location} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Bio</label>
            <textarea name="bio" className="form-control" rows={3} placeholder="Brief professional introduction…" value={form.bio} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Available Days</label>
            <div className="d-flex flex-wrap gap-2">
              {DAYS.map(day => {
                const selected = slots.find(s => s.day===day);
                return (
                  <button type="button" key={day} onClick={() => toggleDay(day)}
                    className="btn btn-sm fw-semibold"
                    style={{background:selected?'#0B6E6E':'#F3F4F6', color:selected?'#fff':'#4A5568', border:`1.5px solid ${selected?'#0B6E6E':'#E5E7EB'}`}}>
                    {day.slice(0,3)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn w-100 fw-bold text-white mt-4" style={{backgroundColor:'#0B6E6E'}}>
          {loading ? 'Submitting…' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}