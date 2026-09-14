import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('predict');
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('Male');
  const [bp, setBp] = useState('Normal');
  const [chol, setChol] = useState('Normal');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('medassist_user');
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      if (u.age) setAge(parseInt(u.age) || 30);
      if (u.gender) setGender(u.gender);
    } else {
      navigate('/login');
    }
    fetch('http://localhost:8000/symptoms')
      .then(r => r.json())
      .then(d => setAllSymptoms(d.symptoms || []))
      .catch(() => setError('AI Backend not running! Start: python app.py (in ai_model folder)'));
    const h = localStorage.getItem('prediction_history');
    if (h) setHistory(JSON.parse(h));
  }, [navigate]);

  const filtered = allSymptoms.filter(s =>
    s.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50);

  const toggleSymptom = (s) => {
    setSelected(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handlePredict = async () => {
    if (selected.length === 0) {
      setError('Please select at least 1 symptom');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8000/full-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selected,
          age: parseInt(age),
          gender,
          blood_pressure: bp,
          cholesterol: chol
        })
      });
      if (!res.ok) throw new Error('Backend error');
      const data = await res.json();
      setResult(data);
      const entry = {
        date: new Date().toLocaleString(),
        disease: data.prediction.predicted_disease,
        confidence: data.prediction.confidence,
        risk: data.risk.risk_category,
        severity: data.risk.severity_score
      };
      const updated = [entry, ...history].slice(0, 10);
      setHistory(updated);
      localStorage.setItem('prediction_history', JSON.stringify(updated));
    } catch (e) {
      setError('AI Backend not running! Start: python app.py (in ai_model folder)');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('medassist_user');
    navigate('/login');
  };

  const getRiskColor = (cat) => ({
    'Critical': '#dc2626', 'High': '#ea580c', 'Moderate': '#ca8a04', 'Low': '#16a34a'
  }[cat] || '#6b7280');

  const getRiskEmoji = (cat) => ({
    'Critical': '🔴', 'High': '🟠', 'Moderate': '🟡', 'Low': '🟢'
  }[cat] || '⚪');

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top Bar */}
      <div style={{ background: 'linear-gradient(135deg,#1e40af,#3b82f6)', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🏥</span>
          <span style={{ fontSize: '18px', fontWeight: '700' }}>MedAssist AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '14px' }}>🤒 {user.name}</span>
          <button onClick={handleLogout} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', padding: '10px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {[
          { key: 'predict', label: '🔍 Disease Prediction' },
          { key: 'reports', label: '💊 Reports & Treatment' },
          { key: 'history', label: '📋 History' },
          { key: 'profile', label: '👤 Profile' }
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: activeTab === t.key ? '#1e40af' : '#f1f5f9', color: activeTab === t.key ? 'white' : '#475569', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px' }}>

        {/* ===== PREDICT TAB ===== */}
        {activeTab === 'predict' && (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

            {/* LEFT: Symptom Selection */}
            <div style={{ flex: 1, minWidth: '350px' }}>
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>

                <h3 style={{ color: '#1e40af', marginTop: 0, marginBottom: '10px' }}>
                  🔍 Search & Select Symptoms ({selected.length} selected)
                </h3>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type symptom... (fever, cough, chest pain...)"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px' }}
                />

                {/* Symptom List */}
                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px', marginBottom: '15px' }}>
                  {filtered.map(s => (
                    <div key={s} onClick={() => toggleSymptom(s)}
                      style={{
                        padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                        borderBottom: '1px solid #f8fafc',
                        background: selected.includes(s) ? '#dcfce7' : 'white',
                        fontWeight: selected.includes(s) ? '600' : '400'
                      }}>
                      {selected.includes(s) ? '✅ ' : '⬜ '}{s}
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No symptoms found
                    </div>
                  )}
                </div>

                {/* Selected Symptoms */}
                {selected.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>SELECTED:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selected.map(s => (
                        <span key={s} onClick={() => toggleSymptom(s)}
                          style={{ background: '#1e40af', color: 'white', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer' }}>
                          {s.length > 25 ? s.substring(0, 25) + '...' : s} ✕
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patient Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '3px' }}>Age</label>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '3px' }}>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                      <option>Male</option><option>Female</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '3px' }}>Blood Pressure</label>
                    <select value={bp} onChange={(e) => setBp(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                      <option>Normal</option><option>High</option><option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '3px' }}>Cholesterol</label>
                    <select value={chol} onChange={(e) => setChol(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                      <option>Normal</option><option>High</option><option>Low</option>
                    </select>
                  </div>
                </div>

                <button onClick={handlePredict} disabled={loading}
                  style={{ width: '100%', padding: '13px', background: loading ? '#93c5fd' : '#1e40af', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? '⏳ AI Analyzing...' : '🔍 Predict Disease'}
                </button>

                {error && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#fef2f2', border: '1px solid #dc2626', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>
                    ⚠️ {error}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Results */}
            <div style={{ flex: 1, minWidth: '320px' }}>
              {result ? (
                <>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '2px solid #1e40af', marginBottom: '15px' }}>
                    <h3 style={{ color: '#1e40af', marginTop: 0, marginBottom: '10px' }}>🔬 Disease Prediction</h3>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#1e3a8a', marginBottom: '4px' }}>
                      {result.prediction.predicted_disease}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                      Confidence: <strong style={{ color: '#1e40af' }}>{result.prediction.confidence}%</strong>
                    </div>
                    <div style={{ marginTop: '15px' }}>
                      <h4 style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Predictions</h4>
                      {result.prediction.top_predictions.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                          <span style={{ fontSize: '12px', color: '#94a3b8', width: '18px' }}>{i + 1}.</span>
                          <span style={{ flex: 1, fontSize: '12px', fontWeight: i === 0 ? '600' : '400' }}>
                            {p.disease}
                          </span>
                          <div style={{ flex: 1.2, height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${p.probability}%`, background: i === 0 ? '#1e40af' : '#93c5fd' }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '700', width: '50px', textAlign: 'right' }}>{p.probability}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: `2px solid ${getRiskColor(result.risk.risk_category)}`, marginBottom: '15px' }}>
                    <h3 style={{ color: '#92400e', marginTop: 0, marginBottom: '10px' }}>⚕️ Risk Assessment</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '28px' }}>{getRiskEmoji(result.risk.risk_category)}</span>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: getRiskColor(result.risk.risk_category) }}>
                          {result.risk.risk_category} Risk
                        </div>
                        {result.risk.is_emergency && (
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#dc2626', color: 'white', fontSize: '11px', fontWeight: '700', display: 'inline-block', marginTop: '4px' }}>⚠️ EMERGENCY</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '25px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Severity</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: getRiskColor(result.risk.risk_category) }}>{result.risk.severity_score}/100</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Symptoms</div>
                        <div style={{ fontSize: '18px', fontWeight: '700' }}>{result.risk.symptom_count}</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Recommendations */}
                  <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #16a34a' }}>
                    <h3 style={{ color: '#16a34a', marginTop: 0, marginBottom: '10px' }}>💊 Immediate Recommendations</h3>
                    {result.recommendations.map((r, i) => (
                      <div key={i} style={{ padding: '6px 0', borderBottom: i < result.recommendations.length - 1 ? '1px solid #dcfce7' : 'none', fontSize: '14px', color: '#1e3a8a' }}>
                        <span style={{ marginRight: '8px' }}>→</span>{r}
                      </div>
                    ))}
                    <button onClick={() => setActiveTab('reports')}
                      style={{ width: '100%', marginTop: '15px', padding: '11px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                      💊 View Full Treatment Plan →
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ background: 'white', borderRadius: '12px', padding: '50px 30px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '56px', marginBottom: '10px' }}>🏥</div>
                  <h3 style={{ color: '#475569', marginTop: 0 }}>Select Symptoms & Click Predict</h3>
                  <p style={{ color: '#94a3b8', fontSize: '14px' }}>AI analyzes symptoms (95%+ accuracy model)</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== REPORTS & TREATMENT TAB ===== */}
        {activeTab === 'reports' && (
          <div>
            {result && result.treatment ? (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

                {/* Treatment Plan */}
                <div style={{ flex: 1.2, minWidth: 320, background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
                  <h3 style={{ color: '#1e40af', marginTop: 0, marginBottom: 5 }}>💊 Treatment Plan</h3>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1e3a8a', marginBottom: 3 }}>
                    {result.prediction.predicted_disease}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 18 }}>
                    Confidence: {result.prediction.confidence}% | Risk: {result.risk.risk_category}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <b style={{ color: '#16a34a', fontSize: 13 }}>💊 Medical Treatments:</b>
                    {result.treatment.treatments.map((t, i) => (
                      <div key={i} style={{ padding: '4px 0 4px 14px', fontSize: 13 }}>• {t}</div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <b style={{ color: '#0ea5e9', fontSize: 13 }}>🛡 Preventive Care:</b>
                    {result.treatment.prevention.map((t, i) => (
                      <div key={i} style={{ padding: '4px 0 4px 14px', fontSize: 13 }}>• {t}</div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <b style={{ color: '#8b5cf6', fontSize: 13 }}>🌿 Lifestyle Advice:</b>
                    {result.treatment.lifestyle.map((t, i) => (
                      <div key={i} style={{ padding: '4px 0 4px 14px', fontSize: 13 }}>• {t}</div>
                    ))}
                  </div>

                  <div style={{ background: '#fefce8', borderRadius: 8, padding: 14, border: '1px solid #fde047' }}>
                    <b style={{ fontSize: 13, color: '#ca8a04' }}>📅 Follow-up Guidance:</b>
                    <div style={{ fontSize: 13, marginTop: 4 }}>{result.treatment.followup}</div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>
                      👨‍⚕️ Recommended Specialist: <b style={{ color: '#16a34a' }}>{result.treatment.specialist}</b>
                    </div>
                  </div>
                </div>

                {/* Patient Summary */}
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', marginBottom: 15 }}>
                    <h3 style={{ color: '#1e40af', marginTop: 0, marginBottom: 12 }}>📋 Patient Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Age</span><span><b>{result.patient.age}</b></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Gender</span><span><b>{result.patient.gender}</b></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Blood Pressure</span><span><b>{result.patient.blood_pressure}</b></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Cholesterol</span><span><b>{result.patient.cholesterol}</b></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Risk Category</span>
                      <span><b style={{ color: getRiskColor(result.risk.risk_category) }}>{result.risk.risk_category}</b></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Severity Score</span><span><b>{result.risk.severity_score}/100</b></span>
                    </div>
                  </div>

                  {/* Report Info */}
                  <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: '#1e40af', marginTop: 0, marginBottom: 10 }}>📄 Report Details</h3>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                      Report ID: <b style={{ fontFamily: 'monospace' }}>{result.report_id}</b><br />
                      Generated: {result.generated_at}
                    </div>

                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 15 }}>
                      Symptoms ({result.patient.symptoms.length}):
                      <div style={{ marginTop: 6 }}>
                        {result.patient.symptoms.slice(0, 5).map((s, i) => (
                          <span key={i} style={{ display: 'inline-block', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: 10, fontSize: 11, margin: 2 }}>
                            {s.length > 20 ? s.substring(0, 20) + '...' : s}
                          </span>
                        ))}
                        {result.patient.symptoms.length > 5 && (
                          <span style={{ fontSize: 11, color: '#94a3b8' }}> +{result.patient.symptoms.length - 5} more</span>
                        )}
                      </div>
                    </div>

                    <Link to="/reports" style={{ display: 'block', textAlign: 'center', padding: 13, background: '#dc2626', color: 'white', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                      📄 View / Download Full Report
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 12, padding: 50, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 50, marginBottom: 10 }}>📄</div>
                <h3 style={{ color: '#475569', marginTop: 0 }}>No Report Yet</h3>
                <p style={{ color: '#94a3b8', fontSize: 14 }}>
                  Make a prediction first — then treatment plan & report generate avutundi!
                </p>
                <button onClick={() => setActiveTab('predict')}
                  style={{ marginTop: 10, padding: '11px 24px', background: '#1e40af', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  🔍 Go to Prediction
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {activeTab === 'history' && (
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#1e40af', marginTop: 0 }}>📋 Prediction History</h3>
            {history.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No predictions yet. Make a prediction from Predict tab!</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Date', 'Disease', 'Confidence', 'Risk', 'Severity'].map(h => (
                      <th key={h} style={{ padding: '10px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontSize: '13px' }}>{h.date}</td>
                      <td style={{ padding: '10px', fontSize: '13px', fontWeight: '600' }}>{h.disease}</td>
                      <td style={{ padding: '10px', fontSize: '13px' }}>{h.confidence}%</td>
                      <td style={{ padding: '10px', fontSize: '13px', color: getRiskColor(h.risk), fontWeight: '600' }}>{h.risk}</td>
                      <td style={{ padding: '10px', fontSize: '13px' }}>{h.severity}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ===== PROFILE TAB ===== */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '30px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: '60px' }}>🤒</div>
              <h2 style={{ margin: '10px 0 5px 0', color: '#1e3a8a' }}>{user.name}</h2>
              <span style={{ padding: '4px 12px', background: '#eff6ff', borderRadius: '6px', color: '#1e40af', fontSize: '13px', fontWeight: '600' }}>Patient</span>
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#6b7280' }}>Email</span><span>{user.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#6b7280' }}>Gender</span><span>{user.gender || 'Male'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: '#6b7280' }}>Age</span><span>{user.age || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;