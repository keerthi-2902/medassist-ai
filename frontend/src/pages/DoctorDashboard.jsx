import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Analytics from './Analytics';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('medassist_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate('/login');
    }
    fetch('http://localhost:8000/analytics/summary')
      .then(r => r.json())
      .then(d => setAnalytics(d))
      .catch(() => setError('AI Backend not running! Start: python app.py'));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('medassist_user');
    navigate('/login');
  };

  if (!user) return null;

  const riskColors = {
    'Critical': '#dc2626', 'High': '#ea580c',
    'Moderate': '#ca8a04', 'Low': '#16a34a'
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top Bar */}
      <div style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🏥</span>
          <span style={{ fontSize: '18px', fontWeight: '700' }}>MedAssist AI - Doctor Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '14px' }}>👨‍⚕️ Dr. {user.name}</span>
          <button onClick={handleLogout} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', padding: '10px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'patients', label: '🤒 Patients' },
          { key: 'analytics', label: '📈 Analytics Dashboard' },
          { key: 'profile', label: '👤 My Profile' }
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: activeTab === tab.key ? '#16a34a' : '#f1f5f9', color: activeTab === tab.key ? 'white' : '#475569', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '20px' }}>

        {error && (
          <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #dc2626', borderRadius: '10px', color: '#dc2626', marginBottom: 16, textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ===== OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤒</div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e3a8a' }}>Total AI Predictions</h4>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1e40af' }}>
                {analytics ? analytics.total_predictions : '...'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200, background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔴</div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e3a8a' }}>Critical Cases</h4>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626' }}>
                {analytics ? analytics.critical_cases : '...'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200, background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⚕️</div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e3a8a' }}>Avg Severity</h4>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#ea580c' }}>
                {analytics ? analytics.avg_severity + '/100' : '...'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200, background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e3a8a' }}>Model Accuracy</h4>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#16a34a' }}>
                {analytics ? analytics.model.accuracy + '%' : '...'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200, background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🩺</div>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e3a8a' }}>Specialty</h4>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>{user.specialty || 'General'}</div>
            </div>
          </div>
        )}

        {/* ===== PATIENTS (REAL DATA) ===== */}
        {activeTab === 'patients' && (
          <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#16a34a', marginTop: 0 }}>🤒 Patient Predictions (Live Data)</h3>
            {!analytics || analytics.recent_predictions.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 14 }}>
                No predictions yet. Patient dashboard lo prediction cheyyi — ippudu ikkada live ga kanipisthundi!
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr style={{ background: '#f0fdf4' }}>
                      <th style={{ padding: 10, textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Time</th>
                      <th style={{ padding: 10, textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Report ID</th>
                      <th style={{ padding: 10, textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Age</th>
                      <th style={{ padding: 10, textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Gender</th>
                      <th style={{ padding: 10, textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Predicted Disease</th>
                      <th style={{ padding: 10, textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Confidence</th>
                      <th style={{ padding: 10, textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recent_predictions.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 10, fontSize: 12 }}>{p.timestamp}</td>
                        <td style={{ padding: 10, fontSize: 12, fontFamily: 'monospace' }}>{p.report_id}</td>
                        <td style={{ padding: 10, fontSize: 14 }}>{p.age}</td>
                        <td style={{ padding: 10, fontSize: 14 }}>{p.gender}</td>
                        <td style={{ padding: 10, fontSize: 14, fontWeight: 600, color: '#1e40af' }}>{p.disease}</td>
                        <td style={{ padding: 10, fontSize: 14 }}>{p.confidence}%</td>
                        <td style={{ padding: 10, fontSize: 14 }}>
                          <span style={{
                            padding: '2px 10px', borderRadius: 4,
                            background: p.risk_category === 'Critical' ? '#fef2f2' : p.risk_category === 'High' ? '#fff7ed' : p.risk_category === 'Moderate' ? '#fefce8' : '#f0fdf4',
                            color: riskColors[p.risk_category] || '#64748b',
                            fontWeight: 600, fontSize: 12
                          }}>
                            {p.risk_category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== ANALYTICS ===== */}
        {activeTab === 'analytics' && <Analytics />}

        {/* ===== PROFILE ===== */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <div style={{ background: 'white', borderRadius: 12, padding: 30, border: '1px solid #e2e8f0' }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 60 }}>👨‍⚕️</div>
                <h2 style={{ margin: '10px 0 5px 0', color: '#1e3a8a' }}>Dr. {user.name}</h2>
                <span style={{ padding: '4px 12px', background: '#f0fdf4', borderRadius: 6, color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
                  {user.specialty || 'General Physician'}
                </span>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#6b7280' }}>Email</span><span style={{ fontWeight: 500 }}>{user.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#6b7280' }}>Role</span><span style={{ fontWeight: 500 }}>Doctor</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: '#6b7280' }}>Specialty</span>
                  <span style={{ fontWeight: 500, color: '#16a34a' }}>{user.specialty || 'General'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;