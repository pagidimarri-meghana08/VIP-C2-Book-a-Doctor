import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success('Welcome back!');
      if (res.role === 'admin')  return navigate('/admin/dashboard');
      if (res.role === 'doctor') return navigate('/doctor/dashboard');
      navigate('/dashboard');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#F7F9F8' }}>
      <div className="card shadow border-0 p-4" style={{ width: '100%', maxWidth: 400 }}>
        <div className="text-center mb-4">
          <span style={{ fontSize: 40 }}>⚕</span>
          <h3 className="fw-bold mt-2">Welcome back</h3>
          <p className="text-muted small">Sign in to your MediBook account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input type="email" className="form-control" placeholder="your@email.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input type="password" className="form-control" placeholder="Your password"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>

          <button type="submit" className="btn w-100 fw-bold py-2 text-white"
            style={{ backgroundColor: '#0B6E6E' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-3 small text-muted">
          No account? <Link to="/register" className="fw-semibold" style={{ color: '#0B6E6E' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}