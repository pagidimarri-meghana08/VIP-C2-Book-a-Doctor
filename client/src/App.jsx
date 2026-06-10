import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Home            from './pages/Home';
import Register        from './pages/Register';
import Login           from './pages/Login';
import Doctors         from './pages/Doctors';
import BookAppointment from './pages/BookAppointment';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard  from './pages/DoctorDashboard';
import AdminDashboard   from './pages/AdminDashboard';
import ApplyDoctor      from './pages/ApplyDoctor';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            {/* Public */}
            <Route path="/"         element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/doctors"  element={<Doctors />} />

            {/* Protected — patients */}
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['patient','doctor']}>
                <PatientDashboard />
              </ProtectedRoute>
            }/>
            <Route path="/book/:doctorId" element={
              <ProtectedRoute roles={['patient']}>
                <BookAppointment />
              </ProtectedRoute>
            }/>
            <Route path="/apply-doctor" element={
              <ProtectedRoute roles={['patient']}>
                <ApplyDoctor />
              </ProtectedRoute>
            }/>

            {/* Protected — doctors */}
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute roles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }/>

            {/* Protected — admin */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }/>
          </Routes>
        </main>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </BrowserRouter>
    </AuthProvider>
  );
}