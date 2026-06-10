import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../utils/api';

const TIME_SLOTS = ['9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];

const getNext5Dates = () => {
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    dates.push({ label: d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}), value: d.toISOString().split('T')[0] });
  }
  return dates;
};

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor]   = useState(null);
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({ date: '', timeSlot: '', visitType: 'In-Person', reason: '' });
  const [files, setFiles]     = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get(`/doctors/${doctorId}`)
      .then(({ data }) => setDoctor(data.doctor))
      .catch(() => toast.error('Doctor not found'));
  }, [doctorId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('doctorId',       doctorId);
      formData.append('appointmentDate', form.date);
      formData.append('timeSlot',        form.timeSlot);
      formData.append('visitType',       form.visitType);
      formData.append('reason',          form.reason);
      files.forEach(f => formData.append('documents', f));

      await API.post('/appointments', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Appointment booked successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return <div className="text-center py-5"><div className="spinner-border" style={{ color:'#0B6E6E' }} /></div>;

  const dates = getNext5Dates();

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <h3 className="fw-bold mb-4">Book an Appointment</h3>

      {/* Progress */}
      <div className="d-flex align-items-center mb-4 gap-2">
        {['Select Date & Time','Visit Details','Confirm'].map((s,i) => (
          <div key={s} className="d-flex align-items-center gap-2" style={{ flex: i < 2 ? 1 : 'auto' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style={{ width:32, height:32, background: step>i+1?'#0B6E6E':step===i+1?'#0B6E6E':'#E5E7EB', color: step>=i+1?'#fff':'#9CA3AF', fontSize:13, flexShrink:0 }}>
              {step > i+1 ? '✓' : i+1}
            </div>
            <span className="small fw-semibold" style={{ color: step>=i+1?'#0B6E6E':'#9CA3AF', whiteSpace:'nowrap' }}>{s}</span>
            {i < 2 && <div style={{ flex:1, height:2, background: step>i+1?'#0B6E6E':'#E5E7EB' }} />}
          </div>
        ))}
      </div>

      {/* Doctor card */}
      <div className="card border-0 bg-light p-3 mb-4">
        <div className="d-flex gap-3 align-items-center">
          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
            style={{ width:48,height:48,background:'#0B6E6E',flexShrink:0 }}>
            {doctor.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
          </div>
          <div>
            <div className="fw-bold">{doctor.user?.name}</div>
            <div className="small" style={{ color:'#0B6E6E' }}>{doctor.specialty} · {doctor.hospital}</div>
            <div className="small text-muted">Consultation fee: ₹{doctor.consultationFee}</div>
          </div>
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="card border-0 shadow-sm p-4">
          <h5 className="fw-bold mb-3">Choose a date</h5>
          <div className="d-flex flex-wrap gap-2 mb-4">
            {dates.map(d => (
              <button key={d.value} onClick={() => setForm({...form, date:d.value})}
                className="btn btn-sm fw-semibold"
                style={{ background: form.date===d.value?'#0B6E6E':'#F3F4F6', color:form.date===d.value?'#fff':'#1A2332', border:`1.5px solid ${form.date===d.value?'#0B6E6E':'#E5E7EB'}` }}>
                {d.label}
              </button>
            ))}
          </div>

          {form.date && <>
            <h5 className="fw-bold mb-3">Available slots</h5>
            <div className="row g-2 mb-4">
              {TIME_SLOTS.map(slot => (
                <div className="col-4" key={slot}>
                  <button onClick={() => setForm({...form, timeSlot:slot})} className="btn btn-sm w-100 fw-semibold"
                    style={{ background:form.timeSlot===slot?'#0B6E6E':'#F3F4F6', color:form.timeSlot===slot?'#fff':'#1A2332', border:`1.5px solid ${form.timeSlot===slot?'#0B6E6E':'#E5E7EB'}` }}>
                    {slot}
                  </button>
                </div>
              ))}
            </div>
          </>}

          <button onClick={() => setStep(2)} disabled={!form.date || !form.timeSlot}
            className="btn w-100 fw-bold text-white" style={{ backgroundColor:'#0B6E6E' }}>
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="card border-0 shadow-sm p-4">
          <h5 className="fw-bold mb-3">Visit details</h5>
          <div className="mb-3">
            <label className="form-label fw-semibold">Visit type</label>
            <div className="d-flex gap-3">
              {['In-Person','Video'].map(t => (
                <button key={t} onClick={() => setForm({...form,visitType:t})}
                  className="btn flex-fill fw-semibold"
                  style={{ background:form.visitType===t?'#D6EBE0':'#F3F4F6', color:form.visitType===t?'#0B6E6E':'#4A5568', border:`1.5px solid ${form.visitType===t?'#0B6E6E':'#E5E7EB'}` }}>
                  {t === 'Video' ? '📹' : '🏥'} {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Reason for visit</label>
            <textarea className="form-control" rows={3} placeholder="Briefly describe your symptoms…"
              value={form.reason} onChange={e => setForm({...form,reason:e.target.value})} />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Upload documents (optional)</label>
            <input type="file" className="form-control" multiple accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => setFiles(Array.from(e.target.files))} />
            <small className="text-muted">PDF, JPG, PNG — max 10 MB each</small>
          </div>
          <div className="d-flex gap-2">
            <button onClick={() => setStep(1)} className="btn btn-outline-secondary flex-fill">← Back</button>
            <button onClick={() => setStep(3)} className="btn flex-fill fw-bold text-white" style={{ backgroundColor:'#0B6E6E' }}>Review →</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="card border-0 shadow-sm p-4">
          <h5 className="fw-bold mb-3">Confirm your appointment</h5>
          {[['Doctor', doctor.user?.name],['Specialty',doctor.specialty],['Date',form.date],['Time',form.timeSlot],['Visit Type',form.visitType],['Fee',`₹${doctor.consultationFee}`]].map(([k,v]) => (
            <div className="d-flex justify-content-between py-2 border-bottom" key={k}>
              <span className="text-muted">{k}</span>
              <span className="fw-semibold">{v}</span>
            </div>
          ))}
          {form.reason && <div className="mt-3 p-3 rounded small" style={{ background:'#D6EBE0', color:'#0B6E6E' }}><strong>Reason:</strong> {form.reason}</div>}
          {files.length > 0 && <div className="mt-2 small text-muted">{files.length} document(s) attached</div>}
          <div className="d-flex gap-2 mt-4">
            <button onClick={() => setStep(2)} className="btn btn-outline-secondary flex-fill">← Edit</button>
            <button onClick={handleSubmit} disabled={loading} className="btn flex-fill fw-bold text-white" style={{ backgroundColor:'#E8614A', border:'none' }}>
              {loading ? 'Booking…' : 'Confirm Booking ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}