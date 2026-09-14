import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialty: 'Cardiologist',
    age: '',
    gender: 'Male'
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.email || !form.password) {
      setError('Please fill all fields');
      return;
    }

    // Save registered user info
    const user = {
      email: form.email,
      role: form.role,
      name: form.name,
      specialty: form.specialty,
      age: form.age,
      gender: form.gender
    };
    localStorage.setItem('medassist_registered', JSON.stringify(user));

    // Show success message and redirect to LOGIN (not dashboard)
    setSuccess('Registration successful! Redirecting to login...');

    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const specialties = [
    'Cardiologist', 'Neurologist', 'Orthopedic', 'Dermatologist',
    'Pulmonologist', 'Gastroenterologist', 'Pediatrician',
    'Psychiatrist', 'Oncologist', 'Physiotherapist',
    'General Physician', 'ENT Specialist', 'Ophthalmologist'
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '35px',
        width: '460px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏥</div>
          <h1 style={{ color: '#1e40af', margin: '0 0 5px 0', fontSize: '22px' }}>
            Create Account
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>
            Register to access MedAssist AI
          </p>
        </div>

        <form onSubmit={handleRegister}>
          {/* Role Selection */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              I am a
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setForm({ ...form, role: 'patient' })}
                style={{
                  flex: 1, padding: '12px',
                  border: form.role === 'patient' ? '2px solid #1e40af' : '2px solid #e2e8f0',
                  borderRadius: '10px', background: form.role === 'patient' ? '#eff6ff' : 'white',
                  cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                }}>
                🤒 Patient
              </button>
              <button type="button" onClick={() => setForm({ ...form, role: 'doctor' })}
                style={{
                  flex: 1, padding: '12px',
                  border: form.role === 'doctor' ? '2px solid #1e40af' : '2px solid #e2e8f0',
                  borderRadius: '10px', background: form.role === 'doctor' ? '#eff6ff' : 'white',
                  cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                }}>
                👨‍⚕️ Doctor
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '13px' }}>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Enter name"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '13px' }}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '13px' }}>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create password"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          {form.role === 'doctor' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '13px' }}>Specialty</label>
              <select name="specialty" value={form.specialty} onChange={handleChange}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {form.role === 'patient' && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '13px' }}>Age</label>
                <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Enter age"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '13px' }}>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '10px', marginBottom: '10px',
              background: '#fef2f2', border: '1px solid #dc2626',
              borderRadius: '8px', color: '#dc2626', fontSize: '13px', textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              padding: '10px', marginBottom: '10px',
              background: '#f0fdf4', border: '1px solid #16a34a',
              borderRadius: '8px', color: '#16a34a', fontSize: '13px', textAlign: 'center'
            }}>
              ✅ {success}
            </div>
          )}

          <button type="submit"
            style={{
              width: '100%', padding: '12px', background: '#1e40af', color: 'white',
              border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700',
              cursor: success ? 'not-allowed' : 'pointer', marginTop: '8px'
            }}
            disabled={!!success}
          >
            {success ? '✅ Registered!' : 'Create Account →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#6b7280' }}>
          Already have account?{' '}
          <Link to="/login" style={{ color: '#1e40af', fontWeight: '600' }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;