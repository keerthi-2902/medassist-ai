import { useState, useEffect } from 'react';

function Reports() {
  const [report, setReport] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/latest-report')
      .then(r => r.json())
      .then(setReport)
      .catch(() => setError('Report load avvatledu! Prediction cheyyi first.'));
    fetch('http://localhost:8000/model-info')
      .then(r => r.json())
      .then(setModelInfo)
      .catch(() => {});
  }, []);

  const downloadPDF = () => window.print();

  const downloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MedAssist_Report_${report.report_id || 'latest'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#dc2626' }}>
      <div style={{ fontSize: 50, marginBottom: 10 }}>📄</div>
      <h2>Report Not Found</h2>
      <p>{error}</p>
      <p style={{ fontSize: 13, color: '#64748b' }}>
        Patient Dashboard → Predict tab → symptoms select → Predict Disease click cheyyi
      </p>
    </div>
  );

  if (!report) return (
    <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
      Loading report...
    </div>
  );

  // Old format report - no treatment data
  if (!report.treatment || !report.report_id) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 50, marginBottom: 10 }}>📄</div>
        <h2 style={{ color: '#475569' }}>Old Format Report</h2>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          Fresh prediction cheyyi - kotha report treatment data tho vasthundi!
        </p>
      </div>
    );
  }

  const riskColor = {
    'Critical': '#dc2626', 'High': '#ea580c',
    'Moderate': '#ca8a04', 'Low': '#16a34a'
  }[report.risk.risk_category] || '#64748b';

  return (
    <div style={{ padding: 20, maxWidth: 850, margin: '0 auto' }}>

      {/* Action Buttons - printing lo hide avthayi */}
      <div className="no-print" style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={downloadPDF}
          style={{ padding: '11px 22px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
          📄 Download PDF Report
        </button>
        <button onClick={downloadJSON}
          style={{ padding: '11px 22px', background: '#1e40af', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
          ⬇ Download JSON
        </button>
      </div>

      {/* ===== PRINTABLE REPORT ===== */}
      <div style={{ background: 'white', borderRadius: 12, padding: 40, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '3px solid #1e40af', paddingBottom: 15, marginBottom: 25 }}>
          <div style={{ fontSize: 44 }}>🏥</div>
          <h1 style={{ margin: '8px 0 2px 0', color: '#1e40af', fontSize: 26 }}>MedAssist AI</h1>
          <div style={{ color: '#64748b', fontSize: 14 }}>Health Report - Disease Prediction & Risk Assessment</div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
            Report ID: {report.report_id} | Generated: {report.generated_at}
          </div>
        </div>

        {/* 1. Patient Information */}
        <h3 style={{ color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, fontSize: 15 }}>
          1. PATIENT INFORMATION
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, margin: '12px 0 22px 0' }}>
          <div><b>Age:</b> {report.patient.age}</div>
          <div><b>Gender:</b> {report.patient.gender}</div>
          <div><b>Blood Pressure:</b> {report.patient.blood_pressure}</div>
          <div><b>Cholesterol:</b> {report.patient.cholesterol}</div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <b>Symptoms Reported ({report.patient.symptoms.length}):</b>
          <div style={{ marginTop: 6 }}>
            {report.patient.symptoms.map((s, i) => (
              <span key={i} style={{ display: 'inline-block', background: '#eff6ff', color: '#1e40af', padding: '3px 10px', borderRadius: 10, fontSize: 12, margin: '2px 3px' }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* 2. AI Prediction */}
        <h3 style={{ color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, fontSize: 15 }}>
          2. AI DISEASE PREDICTION
        </h3>
        <div style={{ background: '#eff6ff', borderRadius: 8, padding: 16, margin: '12px 0 22px 0' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1e3a8a' }}>
            {report.prediction.predicted_disease}
          </div>
          <div style={{ color: '#1e40af', fontSize: 14, marginTop: 4 }}>
            Prediction Confidence: <b>{report.prediction.confidence}%</b>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 22 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>#</th>
              <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Possible Disease</th>
              <th style={{ padding: 8, textAlign: 'left', fontSize: 12 }}>Probability</th>
            </tr>
          </thead>
          <tbody>
            {report.prediction.top_predictions.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: 8, fontSize: 13 }}>{i + 1}</td>
                <td style={{ padding: 8, fontSize: 13, fontWeight: i === 0 ? 700 : 400 }}>{p.disease}</td>
                <td style={{ padding: 8, fontSize: 13 }}>{p.probability}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 3. Risk Assessment */}
        <h3 style={{ color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, fontSize: 15 }}>
          3. RISK ASSESSMENT
        </h3>
        <div style={{ margin: '12px 0 22px 0' }}>
          <div style={{ display: 'flex', gap: 25, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>RISK CATEGORY</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: riskColor }}>{report.risk.risk_category}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>SEVERITY SCORE</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{report.risk.severity_score}/100</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>EMERGENCY</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: report.risk.is_emergency ? '#dc2626' : '#16a34a' }}>
                {report.risk.is_emergency ? 'YES' : 'NO'}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Treatment Recommendations */}
        <h3 style={{ color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, fontSize: 15 }}>
          4. TREATMENT RECOMMENDATIONS
        </h3>
        <div style={{ margin: '12px 0 22px 0' }}>
          <div style={{ marginBottom: 14 }}>
            <b style={{ color: '#16a34a' }}>💊 Medical Treatments:</b>
            {report.treatment.treatments.map((t, i) => (
              <div key={i} style={{ padding: '3px 0 3px 15px', fontSize: 13 }}>• {t}</div>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <b style={{ color: '#0ea5e9' }}>🛡 Preventive Care:</b>
            {report.treatment.prevention.map((t, i) => (
              <div key={i} style={{ padding: '3px 0 3px 15px', fontSize: 13 }}>• {t}</div>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <b style={{ color: '#8b5cf6' }}>🌿 Lifestyle Advice:</b>
            {report.treatment.lifestyle.map((t, i) => (
              <div key={i} style={{ padding: '3px 0 3px 15px', fontSize: 13 }}>• {t}</div>
            ))}
          </div>
          <div style={{ background: '#fefce8', borderRadius: 8, padding: 12, border: '1px solid #fde047' }}>
            <b style={{ color: '#ca8a04' }}>📅 Follow-up Guidance:</b>
            <div style={{ fontSize: 13, marginTop: 4 }}>{report.treatment.followup}</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              👨‍⚕️ Recommended Specialist: <b>{report.treatment.specialist}</b>
            </div>
          </div>
        </div>

        {/* 5. Immediate Care */}
        <h3 style={{ color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, fontSize: 15 }}>
          5. IMMEDIATE CARE ADVICE
        </h3>
        {report.recommendations.map((r, i) => (
          <div key={i} style={{ padding: '5px 0 5px 15px', fontSize: 13 }}>→ {r}</div>
        ))}

        {/* Footer */}
        <div style={{ marginTop: 30, paddingTop: 15, borderTop: '2px solid #1e40af', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          {modelInfo && (
            <div>
              AI Model: {modelInfo.best_model || 'RandomForest'} |
              Accuracy: {modelInfo.accuracy || 95.58}% |
              Trained on {modelInfo.total_symptoms || 1326}+ symptoms
            </div>
          )}
          <div style={{ marginTop: 6, fontStyle: 'italic' }}>
            ⚠️ This is an AI-assisted preliminary assessment, NOT a medical diagnosis. Always consult a licensed doctor.
          </div>
          <div style={{ marginTop: 4 }}>
            Generated by MedAssist AI - Medical Symptom Analysis & Disease Prediction System
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;