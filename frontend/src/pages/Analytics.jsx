import { useState, useEffect } from 'react';

function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/analytics/summary')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('AI Backend not running!'); setLoading(false); });
  }, []);

  const exportCSV = () => {
    window.open('http://localhost:8000/analytics/export', '_blank');
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>⏳ Loading analytics...</div>;
  if (error) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#dc2626' }}>
      ⚠️ {error}<br />
      <small>Start: cd ai_model → python app.py</small>
    </div>
  );
  if (!data) return null;

  const riskColors = { Critical: '#dc2626', High: '#ea580c', Moderate: '#ca8a04', Low: '#16a34a' };
  const maxRisk = Math.max(...Object.values(data.risk_distribution), 1);
  const maxDisease = Math.max(...data.top_diseases.map(d => d.count), 1);
  const maxSymptom = Math.max(...data.top_symptoms.map(s => s.count), 1);
  const maxTrend = Math.max(...data.daily_trend.map(t => t.count), 1);

  return (
    <div style={{ padding: '20px', maxWidth: 1150, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e40af' }}>📊 Healthcare Analytics Dashboard</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: 13 }}>Disease prediction insights & health monitoring</p>
        </div>
        <button onClick={exportCSV} style={{ padding: '9px 18px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          ⬇ Export CSV Report
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 22 }}>
        {[
            { icon: '🔬', label: 'Total Predictions', value: data.total_predictions, color: '#1e40af' },
            { icon: '⚕️', label: 'Avg Severity', value: data.avg_severity + '/100', color: '#ea580c' },
            { icon: '🚨', label: 'Critical Cases', value: data.critical_cases, color: '#dc2626' },
            { icon: '🤖', label: 'Model Accuracy', value: data.model.accuracy + '%', color: '#16a34a' }
        ].map(c => (
          <div key={c.label} style={{ flex: 1, minWidth: 200, background: 'white', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

        {/* Risk Distribution */}
        <div style={{ flex: 1, minWidth: 300, background: 'white', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, color: '#1e3a8a', fontSize: 15 }}>⚕️ Risk Category Distribution</h3>
          {Object.keys(riskColors).map(cat => {
            const count = data.risk_distribution[cat] || 0;
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: riskColors[cat] }}>{cat}</span>
                  <span>{count} ({data.total_predictions ? Math.round(count / data.total_predictions * 100) : 0}%)</span>
                </div>
                <div style={{ height: 14, background: '#f1f5f9', borderRadius: 7, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / maxRisk) * 100}%`, background: riskColors[cat], borderRadius: 7, transition: 'width 0.6s' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Prediction Trend */}
        <div style={{ flex: 1, minWidth: 300, background: 'white', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, color: '#1e3a8a', fontSize: 15 }}>📈 Predictions Trend (Daily)</h3>
          {data.daily_trend.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No data yet - make predictions first!</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, marginTop: 15 }}>
              {data.daily_trend.slice(-12).map((t, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: '#1e40af' }}>{t.count}</div>
                  <div style={{ height: Math.max((t.count / maxTrend) * 85, 6), background: 'linear-gradient(180deg,#3b82f6,#1e40af)', borderRadius: '6px 6px 0 0' }} />
                  <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 5 }}>{t.date.slice(5)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Diseases */}
        <div style={{ flex: 1, minWidth: 300, background: 'white', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, color: '#1e3a8a', fontSize: 15 }}>🏥 Most Predicted Diseases</h3>
          {data.top_diseases.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No predictions yet!</p>
          ) : data.top_diseases.slice(0, 7).map((d, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ fontWeight: 500 }}>{d.disease.length > 28 ? d.disease.substring(0, 28) + '…' : d.disease}</span>
                <span style={{ fontWeight: 700, color: '#1e40af' }}>{d.count}</span>
              </div>
              <div style={{ height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(d.count / maxDisease) * 100}%`, background: 'linear-gradient(90deg,#60a5fa,#1e40af)', borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Symptom Trends */}
        <div style={{ flex: 1, minWidth: 300, background: 'white', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, color: '#1e3a8a', fontSize: 15 }}>🔍 Symptom Trend Analysis</h3>
          {data.top_symptoms.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No symptom data yet!</p>
          ) : data.top_symptoms.slice(0, 8).map((s, i) => (
            <div key={i} style={{ marginBottom: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                <span style={{ fontWeight: 500 }}>{s.symptom.length > 26 ? s.symptom.substring(0, 26) + '…' : s.symptom}</span>
                <span style={{ fontWeight: 700, color: '#16a34a' }}>{s.count}</span>
              </div>
              <div style={{ height: 9, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(s.count / maxSymptom) * 100}%`, background: 'linear-gradient(90deg,#86efac,#16a34a)', borderRadius: 5 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div style={{ background: 'white', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#1e3a8a', fontSize: 15 }}>🕐 Recent AI Predictions</h3>
        {data.recent_predictions.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>No predictions yet. Make a prediction from Patient Dashboard!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Time', 'Report ID', 'Disease', 'Confidence', 'Risk', 'Severity', 'Age'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 12, color: '#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recent_predictions.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '9px 12px', fontSize: 12 }}>{p.timestamp}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontFamily: 'monospace' }}>{p.report_id}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 600, color: '#1e40af' }}>{p.disease}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12 }}>{p.confidence}%</td>
                    <td style={{ padding: '9px 12px', fontSize: 12, fontWeight: 600, color: riskColors[p.risk_category] || '#64748b' }}>{p.risk_category}</td>
                    <td style={{ padding: '9px 12px', fontSize: 12 }}>{p.severity}/100</td>
                    <td style={{ padding: '9px 12px', fontSize: 12 }}>{p.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;