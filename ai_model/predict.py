import pandas as pd
import numpy as np
import joblib
import json
import os

# ============================================================
# LOAD MODEL
# ============================================================

model = joblib.load("models/disease_model.pkl")
feature_encoders = joblib.load("models/feature_encoders.pkl")
disease_encoder = joblib.load("models/disease_encoder.pkl")

try:
    risk_config = joblib.load("models/risk_config.pkl")
except:
    risk_config = {}

try:
    model_metrics = joblib.load("models/model_metrics.pkl")
except:
    model_metrics = {}


# ============================================================
# RISK FUNCTIONS
# ============================================================

def calculate_severity(symptom_count, age, bp, cholesterol):
    score = 0
    score += min(symptom_count * 7.5, 30)
    if age >= 60: score += 25
    elif age >= 40: score += 15
    elif age >= 25: score += 5
    score += {"High": 20, "Low": 10, "Normal": 0}.get(str(bp), 5)
    score += {"High": 25, "Low": 5, "Normal": 0}.get(str(cholesterol), 5)
    return min(score, 100)


def get_risk_category(score):
    if score >= 75: return "Critical", "🔴"
    elif score >= 50: return "High", "🟠"
    elif score >= 25: return "Moderate", "🟡"
    else: return "Low", "🟢"


def get_recommendations(category):
    recs = {
        "Critical": [
            "SEEK IMMEDIATE MEDICAL ATTENTION",
            "Call emergency services (911)",
            "Go to nearest hospital immediately",
            "Monitor vital signs continuously"
        ],
        "High": [
            "Schedule urgent doctor appointment within 24 hours",
            "Monitor symptoms closely",
            "Avoid physical exertion",
            "Keep emergency contacts ready"
        ],
        "Moderate": [
            "Schedule doctor appointment within 1 week",
            "Rest and stay hydrated",
            "Monitor for worsening symptoms",
            "Follow prescribed medications if any"
        ],
        "Low": [
            "Monitor symptoms at home",
            "Maintain healthy lifestyle",
            "Schedule routine check-up if concerned",
            "Stay hydrated and get adequate rest"
        ]
    }
    return recs.get(category, recs["Low"])


# ============================================================
# PATIENT INPUT
# ============================================================

patient = {
    "Fever": "Yes",
    "Cough": "Yes",
    "Fatigue": "Yes",
    "Difficulty Breathing": "No",
    "Age": 25,
    "Gender": "Female",
    "Blood Pressure": "Normal",
    "Cholesterol Level": "Normal",
    "Outcome Variable": "Positive"
}


# ============================================================
# ENCODE INPUT
# ============================================================

input_df = pd.DataFrame([patient])

# Force encode each column using saved encoders
for column in feature_encoders:
    if column in input_df.columns:
        encoder = feature_encoders[column]
        input_df[column] = input_df[column].astype(str).map(
            lambda x: encoder.transform([x])[0] if x in encoder.classes_ else 0
        )

# Ensure column order matches training
expected_cols = list(feature_encoders.keys())
input_df = input_df[expected_cols]


# ============================================================
# PREDICT
# ============================================================

prediction = model.predict(input_df)[0]
probabilities = model.predict_proba(input_df)[0]
predicted_disease = disease_encoder.inverse_transform([prediction])[0]

sorted_idx = np.argsort(probabilities)[::-1]
top_preds = []
for idx in sorted_idx[:5]:
    top_preds.append({
        "disease": str(disease_encoder.classes_[idx]),
        "probability": round(float(probabilities[idx] * 100), 2)
    })


# ============================================================
# RISK ASSESSMENT
# ============================================================

symptom_cols = [c for c in patient.keys()
                if c not in ["Age", "Gender", "Blood Pressure",
                             "Cholesterol Level", "Outcome Variable"]]

symptom_count = sum(1 for c in symptom_cols
                    if str(patient.get(c, "")).lower() == "yes")

age = patient.get("Age", 30)
bp = patient.get("Blood Pressure", "Normal")
chol = patient.get("Cholesterol Level", "Normal")

severity = calculate_severity(symptom_count, age, bp, chol)
risk_cat, risk_emoji = get_risk_category(severity)
is_emergency = severity >= 75
recs = get_recommendations(risk_cat)


# ============================================================
# PRINT REPORT
# ============================================================

print("\n" + "=" * 55)
print("       MedAssist AI - Patient Report")
print("=" * 55)

print("\nPATIENT SYMPTOMS:")
for k, v in patient.items():
    print(f"  {k}: {v}")

print("\n" + "-" * 55)
print("DISEASE PREDICTION:")
print("-" * 55)
print(f"  Predicted Disease: {predicted_disease}")
print(f"  Confidence: {top_preds[0]['probability']}%")

print("\n  Top Predictions:")
for i, p in enumerate(top_preds):
    bar = "█" * int(p["probability"] / 5)
    print(f"  {i+1}. {p['disease']:<25} {p['probability']:>6.2f}%  {bar}")

print("\n" + "-" * 55)
print("RISK ASSESSMENT:")
print("-" * 55)
print(f"  Severity Score: {severity:.1f}/100")
print(f"  Risk Category : {risk_emoji} {risk_cat}")
print(f"  Emergency     : {'YES' if is_emergency else 'No'}")
print(f"  Symptom Count : {symptom_count}")

print("\n" + "-" * 55)
print("RECOMMENDATIONS:")
print("-" * 55)
for r in recs:
    print(f"  -> {r}")

print("\n" + "=" * 55)


# ============================================================
# SAVE REPORT
# ============================================================

os.makedirs("reports", exist_ok=True)

report = {
    "patient": patient,
    "prediction": {
        "predicted_disease": str(predicted_disease),
        "confidence": top_preds[0]["probability"],
        "top_predictions": top_preds
    },
    "risk": {
        "severity_score": round(float(severity), 2),
        "risk_category": risk_cat,
        "is_emergency": bool(is_emergency)
    },
    "recommendations": recs
}

with open("reports/prediction_report.json", "w") as f:
    json.dump(report, f, indent=2, default=str)

print(f"Report saved: reports/prediction_report.json")