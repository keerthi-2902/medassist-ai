import { useState } from 'react';

function Prediction() {
  const [form, setForm] = useState({
    Fever: 'No',
    Cough: 'No',
    Fatigue: 'No',
    Difficulty_Breathing: 'No',
    Age: 30,
    Gender: 'Male',
    Blood_Pressure: 'Normal',
    Cholesterol_Level: 'Normal',
    Outcome_Variable: 'Positive'
  });

  const [result, setResult] = useState(null);
  const [risk, setRisk] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handlePredict = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/full-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        throw new Error('Backend error');
      }
      const data = await response.json();
      setResult(data.prediction);
      setRisk(data.risk);
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Backend not running! Start: python app.py');
    }
    setLoading(false);
  };

  const getRiskColor = (cat) => {
    const colors = {
      'Critical': '#dc2626',
      'High': '#ea580c',
      'Moderate': '#ca8a04',
      'Low': '#16a34a'
    };
    return colors[cat] || '#6b7280';
  };

  const getRiskEmoji = (cat) => {
    const emojis = { 'Critical': '🔴', 'High': '🟠', 'Moderate': '🟡', 'Low': '🟢' };
    return emojis[cat] || '⚪';
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h1 style={{ color: '#1e40af', fontSize: '28px', margin: '0 0 5px 0' }}>
          🏥 MedAssist AI - Disease Prediction
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Enter patient symptoms to predict disease & assess health risk
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* LEFT: Input Form */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ color: '#1e40af', marginTop: 0, marginBottom: '15px' }}>
              📋 Patient Symptoms
            </h3>

            {[
              { key: 'Fever', label: '🤒 Fever' },
              { key: 'Cough', label: '😵 Cough' },
              { key: 'Fatigue', label: '😴 Fatigue' },
              { key: 'Difficulty_Breathing', label: '😮‍💨 Difficulty Breathing' }
            ].map(({ key, label }) => (
              <div key={key} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid #f1f5f9'
              }}>
                <label style={{ fontWeight: '500', fontSize: '14px' }}>{label}</label>
                <select
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '8px',
                    border: form[key] === 'Yes' ? '2px solid #16a34a' : '2px solid #e2e8f0',
                    background: form[key] === 'Yes' ? '#dcfce7' : 'white',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes ✅</option>
                </select>
              </div>
            ))}

            <div style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <label style={{ fontWeight: '500', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                👤 Age
              </label>
              <input
                type="number"
                name="Age"
                value={form.Age}
                onChange={handleChange}
                min="1"
                max="120"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <label style={{ fontWeight: '500', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                🧬 Gender
              </label>
              <select
                name="Gender"
                value={form.Gender}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <label style={{ fontWeight: '500', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                🩸 Blood Pressure
              </label>
              <select
                name="Blood_Pressure"
                value={form.Blood_Pressure}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <label style={{ fontWeight: '500', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                🧪 Cholesterol Level
              </label>
              <select
                name="Cholesterol_Level"
                value={form.Cholesterol_Level}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '18px',
                background: loading ? '#93c5fd' : '#1e40af',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {loading ? '⏳ Analyzing Symptoms...' : '🔍 Predict Disease'}
            </button>

            {error && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                background: '#fef2f2',
                border: '1px solid #dc2626',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '13px'
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Results */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          
          {result && risk ? (
            <>
              {/* Prediction Card */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid #1e40af',
                marginBottom: '15px',
                boxShadow: '0 2px 8px rgba(30,64,175,0.15)'
              }}>
                <h3 style={{ color: '#1e40af', marginTop: 0, marginBottom: '12px' }}>
                  🔬 Disease Prediction
                </h3>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1e3a8a',
                  marginBottom: '4px'
                }}>
                  {result.predicted_disease}
                </div>
                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                  Confidence: <strong style={{ color: '#1e40af' }}>{result.confidence}%</strong>
                </div>

                <div style={{ marginTop: '18px' }}>
                  <h4 style={{ fontSize: '13px', color: '#94a3b8', marginTop: 0, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Top Predictions
                  </h4>
                  {result.top_predictions && result.top_predictions.map((pred, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8', width: '18px' }}>{i + 1}.</span>
                      <span style={{ flex: 1, fontSize: '13px', fontWeight: i === 0 ? '600' : '400' }}>
                        {pred.disease}
                      </span>
                      <div style={{
                        flex: 1.2,
                        height: '10px',
                        background: '#f1f5f9',
                        borderRadius: '5px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${pred.probability}%`,
                          background: i === 0 ? '#1e40af' : '#93c5fd',
                          borderRadius: '5px',
                          transition: 'width 0.5s'
                        }} />
                      </div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        width: '48px',
                        textAlign: 'right',
                        color: i === 0 ? '#1e40af' : '#6b7280'
                      }}>
                        {pred.probability}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment Card */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: `2px solid ${getRiskColor(risk.risk_category)}`,
                marginBottom: '15px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{ color: '#92400e', marginTop: 0, marginBottom: '12px' }}>
                  ⚕️ Risk Assessment
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '15px'
                }}>
                  <span style={{ fontSize: '28px' }}>
                    {getRiskEmoji(risk.risk_category)}
                  </span>
                  <div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: getRiskColor(risk.risk_category)
                    }}>
                      {risk.risk_category} Risk
                    </div>
                    {risk.is_emergency && (
                      <div style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: '4px',
                        background: '#dc2626',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '700',
                        marginTop: '4px'
                      }}>
                        ⚠️ EMERGENCY
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Severity</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: getRiskColor(risk.risk_category) }}>
                      {risk.severity_score}/100
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Symptoms</div>
                    <div style={{ fontSize: '18px', fontWeight: '700' }}>
                      {risk.symptom_count}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations Card */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #16a34a',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{ color: '#16a34a', marginTop: 0, marginBottom: '12px' }}>
                  💊 Recommendations
                </h3>
                {recommendations.map((rec, i) => (
                  <div key={i} style={{
                    padding: '8px 0',
                    borderBottom: i < recommendations.length - 1 ? '1px solid #dcfce7' : 'none',
                    fontSize: '14px',
                    color: '#1e3a8a'
                  }}>
                    <span style={{ marginRight: '8px' }}>→</span>
                    {rec}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '50px 30px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: '56px', marginBottom: '15px' }}>🏥</div>
              <h3 style={{ color: '#475569', marginTop: 0 }}>
                Enter Symptoms & Click Predict
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                AI will analyze symptoms and predict disease with risk assessment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Prediction;