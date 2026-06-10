import { Link } from 'react-router-dom';

export default function Home() {
  const specialties = [
    { icon: '❤️', name: 'Cardiology' },
    { icon: '🧠', name: 'Neurology' },
    { icon: '🦴', name: 'Orthopedics' },
    { icon: '🧒', name: 'Pediatrics' },
    { icon: '🌿', name: 'Dermatology' },
    { icon: '🧘', name: 'Psychiatry' },
    { icon: '👁️', name: 'Ophthalmology' },
    { icon: '🦷', name: 'Dentistry' },
  ];

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#0B6E6E,#0E8A8A)', color: '#fff', padding: '80px 0' }}>
        <div className="container text-center">
          <p className="small text-uppercase fw-bold mb-3" style={{ letterSpacing: 2, opacity: .8 }}>Healthcare, Simplified</p>
          <h1 className="display-4 fw-bold mb-3">
            Find the right doctor,<br />
            <em style={{ color: '#A8C5B5', fontStyle: 'italic' }}>book in minutes.</em>
          </h1>
          <p className="lead mb-4 mx-auto" style={{ maxWidth: 500, opacity: .9 }}>
            Connect with verified specialists. Real-time availability, secure records, seamless scheduling.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Link to="/doctors"  className="btn btn-light btn-lg fw-semibold px-4">Browse Doctors</Link>
            <Link to="/register" className="btn btn-lg px-4 fw-semibold" style={{ background: '#E8614A', color: '#fff', border: 'none' }}>Get Started</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-4 bg-white border-bottom">
        <div className="container">
          <div className="row text-center">
            {[['500+','Verified Doctors'],['50k+','Patients Served'],['98%','Satisfaction Rate'],['24/7','Support']].map(([n,l]) => (
              <div className="col-6 col-md-3 py-2" key={l}>
                <div className="fw-bold fs-2" style={{ color: '#0B6E6E' }}>{n}</div>
                <div className="text-muted small">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-5">
        <div className="container">
          <h2 className="fw-bold mb-1">Browse by Specialty</h2>
          <p className="text-muted mb-4">Find the right specialist for your needs</p>
          <div className="row g-3">
            {specialties.map(s => (
              <div className="col-6 col-md-3" key={s.name}>
                <Link to={`/doctors?specialty=${s.name}`} className="text-decoration-none">
                  <div className="card h-100 text-center p-3 border hover-shadow">
                    <div style={{ fontSize: 36 }}>{s.icon}</div>
                    <div className="fw-semibold mt-2" style={{ color: '#1A2332' }}>{s.name}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5" style={{ background: '#F7F9F8' }}>
        <div className="container">
          <h2 className="fw-bold text-center mb-5">Everything you need, in one place</h2>
          <div className="row g-4">
            {[
              ['📅','Easy Scheduling','Book appointments in real-time with instant confirmation.'],
              ['📁','Secure Records','Upload and share health documents safely and privately.'],
              ['🔔','Smart Reminders','Never miss an appointment with timely notifications.'],
              ['👨‍⚕️','Verified Doctors','All doctors are vetted and approved by our admin team.'],
            ].map(([icon,title,desc]) => (
              <div className="col-md-3" key={title}>
                <div className="card h-100 border-0 shadow-sm p-3">
                  <div style={{ fontSize: 36 }}>{icon}</div>
                  <h6 className="fw-bold mt-3">{title}</h6>
                  <p className="text-muted small">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5 text-center text-white" style={{ background: '#0B6E6E' }}>
        <div className="container">
          <h2 className="fw-bold mb-2">Your health, your schedule.</h2>
          <p className="mb-4 opacity-75">Join 50,000+ patients who simplified their healthcare journey.</p>
          <Link to="/register" className="btn btn-lg px-5 fw-bold" style={{ background: '#E8614A', color: '#fff', border: 'none' }}>
            Get Started — It's Free
          </Link>
        </div>
      </section>
    </>
  );
}