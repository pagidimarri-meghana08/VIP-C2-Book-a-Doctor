import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath =
    user?.role === 'admin'  ? '/admin/dashboard'  :
    user?.role === 'doctor' ? '/doctor/dashboard' :
    '/dashboard';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#0B6E6E' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/">⚕ MediBook</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/doctors">Find Doctors</Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to={dashboardPath}>Dashboard</Link>
              </li>
            )}
          </ul>

          <div className="d-flex gap-2">
            {user ? (
              <>
                <span className="navbar-text text-white me-2">
                  👤 {user.name} <span className="badge bg-light text-dark ms-1">{user.role}</span>
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn btn-outline-light btn-sm">Login</Link>
                <Link to="/register" className="btn btn-light btn-sm text-dark fw-semibold">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}