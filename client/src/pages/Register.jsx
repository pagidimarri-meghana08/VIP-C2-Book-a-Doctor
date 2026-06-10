import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await register(form.name, form.email, form.password, form.role);
    if (res.success) {
      toast.success('Registration successful! Welcome to MediBook.');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#F7F9F8' }}>
      <div className="card shadow border-0 p-4" style={{ width: '100%', maxWidth: 440 }}>
        <div className="text-center mb-4">
          <span style={{ fontSize: 40 }}>⚕</span>
          <h3 className="fw-bold mt-2">Create your account</h3>
          <p className="text-muted small">Join MediBook and take control of your health</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input name="name" type="text" className="form-control" placeholder="John Doe"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input name="email" type="email" className="form-control" placeholder="john@email.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input name="password" type="password" className="form-control" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Register as</label>
            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
              <option value="patient">Patient</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn w-100 fw-bold py-2 text-white"
            style={{ backgroundColor: '#0B6E6E' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-3 small text-muted">
          Already have an account? <Link to="/login" className="fw-semibold" style={{ color: '#0B6E6E' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}