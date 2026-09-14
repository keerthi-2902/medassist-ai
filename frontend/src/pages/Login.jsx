import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  useEffect(() => {
    // Load registered user data
    const saved = localStorage.getItem('medassist_registered');
    if (saved) {
      const user = JSON.parse(saved);
      setRegisteredUser(user);
      setEmail(user.email || '');
      setRole(user.role || 'patient');
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    // Use registered user or create login session
    const user = registeredUser || {
      email,
      role,
      name: role === 'doctor' ? 'Dr. Smith' : 'Patient',
      specialty: 'General Physician',
      age: '',
      gender: 'Male'
    };

    // Make sure role is updated
    user.role = role;
    user.email = email;

    localStorage.setItem('medassist_user', JSON.stringify(user));

    // Navigate based on role
    if (role === 'doctor') {
      navigate('/doctor-dashboard');
    } else {
      navigate('/patient-dashboard');
    }
  };

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
        padding: '40px',
        width: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏥</div>
          <h1 style={{ color: '#1e40af', margin: '0 0 5px 0', fontSize: '24px' }}>
            MedAssist AI
          </h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            Medical Symptom Analysis & Disease Prediction
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Role Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#374151' }}>
              Login as
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRole('patient')}
                style={{
                  flex: 1, padding: '12px',
                  border: role === 'patient' ? '2px solid #1e40af' : '2px solid #e2e8f0',
                  borderRadius: '10px', background: role === 'patient' ? '#eff6ff' : 'white',
                  cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                }}
              >
                🤒 Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                style={{
                  flex: 1, padding: '12px',
                  border: role === 'doctor' ? '2px solid #1e40af' : '2px solid #e2e8f0',
                  borderRadius: '10px', background: role === 'doctor' ? '#eff6ff' : 'white',
                  cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                }}
              >
                👨‍⚕️ Doctor
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%', padding: '10px 14px',
                borderRadius: '8px', border: '1px solid #e2e8f0',
                fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%', padding: '10px 14px',
                borderRadius: '8px', border: '1px solid #e2e8f0',
                fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              color: '#dc2626', fontSize: '13px', marginBottom: '10px',
              textAlign: 'center', padding: '8px',
              background: '#fef2f2', borderRadius: '6px',
              border: '1px solid #dc2626'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%', padding: '12px',
              background: '#1e40af', color: 'white',
              border: 'none', borderRadius: '10px',
              fontSize: '16px', fontWeight: '700', cursor: 'pointer'
            }}
          >
            Login →
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#1e40af', fontWeight: '600' }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;