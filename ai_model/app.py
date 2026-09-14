from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
import joblib
import json
import os
from datetime import datetime

app = FastAPI(title="MedAssist AI API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
disease_encoder = None
risk_config = None
model_metrics = None
feature_columns = []

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)
LOG_FILE = os.path.join(DATA_DIR, "prediction_log.json")


def load_log():
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r") as f:
                return json.load(f)
        except:
            return []
    return []


def save_log(log):
    with open(LOG_FILE, "w") as f:
        json.dump(log, f, indent=2, default=str)


@app.on_event("startup")
def load_model():
    global model, disease_encoder, risk_config, model_metrics, feature_columns
    try:
        model = joblib.load("models/disease_model.pkl")
        disease_encoder = joblib.load("models/disease_encoder.pkl")
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")
    try:
        risk_config = joblib.load("models/risk_config.pkl")
        feature_columns = risk_config.get("feature_columns", [])
    except:
        risk_config = {}
    try:
        model_metrics = joblib.load("models/model_metrics.pkl")
    except:
        model_metrics = {}
    if not feature_columns and model is not None:
        try:
            feature_columns = list(model.feature_names_in_)
        except:
            pass
    print("Total symptom features: " + str(len(feature_columns)))


# ============================================================
# MEDICAL KNOWLEDGE BASE - TREATMENT RECOMMENDATIONS
# ============================================================

DISEASE_TREATMENTS = {
    "Migraine": {
        "treatments": ["Rest in dark quiet room", "OTC pain relievers (ibuprofen/acetaminophen)", "Prescription triptans for severe attacks", "Anti-nausea medication"],
        "prevention": ["Identify and avoid trigger foods", "Maintain regular sleep schedule", "Stay hydrated", "Manage stress levels"],
        "lifestyle": ["Regular exercise (30 min/day)", "Limit caffeine and alcohol", "Keep headache diary", "Practice relaxation techniques"],
        "followup": "Consult neurologist if headaches occur more than 4 times/month",
        "specialist": "Neurologist"
    },
    "Diabetes": {
        "treatments": ["Blood sugar monitoring", "Metformin or prescribed medication", "Insulin therapy if advised", "HbA1c testing every 3 months"],
        "prevention": ["Maintain healthy weight", "Limit sugar and refined carbs", "Regular physical activity", "Annual eye and foot exams"],
        "lifestyle": ["Balanced diabetic diet", "30 min daily walking", "Monitor blood pressure", "Avoid smoking and alcohol"],
        "followup": "Endocrinologist visit every 3 months + HbA1c check",
        "specialist": "Endocrinologist"
    },
    "Hypertension": {
        "treatments": ["Monitor BP twice daily", "Prescribed antihypertensives (ACE inhibitors/ARBs)", "Low-sodium diet (DASH diet)", "Regular BP logbook"],
        "prevention": ["Reduce salt intake below 5g/day", "Maintain healthy weight", "Limit alcohol", "Manage stress"],
        "lifestyle": ["30 min aerobic exercise daily", "Quit smoking", "Adequate sleep 7-8 hours", "Meditation/yoga"],
        "followup": "Cardiologist review every 3 months or if BP > 160/100",
        "specialist": "Cardiologist"
    },
    "Asthma": {
        "treatments": ["Rescue inhaler (Salbutamol) as prescribed", "Controller inhaler (steroid) daily", "Avoid known triggers", "Peak flow monitoring"],
        "prevention": ["Avoid dust, pollen, pet dander", "Flu vaccination yearly", "Avoid smoke exposure", "Keep living space clean"],
        "lifestyle": ["Breathing exercises (pranayama)", "Moderate exercise as tolerated", "Maintain healthy weight", "Humidify dry air"],
        "followup": "Pulmonologist every 6 months; immediate visit if inhaler use increases",
        "specialist": "Pulmonologist"
    },
    "Influenza": {
        "treatments": ["Rest and hydration", "Antivirals (oseltamivir) if within 48 hrs", "Fever reducers (paracetamol)", "Warm salt water gargle"],
        "prevention": ["Annual flu vaccination", "Frequent hand washing", "Avoid close contact with sick", "Cover coughs and sneezes"],
        "lifestyle": ["Adequate fluid intake", "Complete rest 3-5 days", "Vitamin C rich foods", "Gradual return to activity"],
        "followup": "See doctor if fever > 3 days or breathing difficulty",
        "specialist": "General Physician"
    },
    "Common Cold": {
        "treatments": ["Rest and fluids", "Decongestants for blocked nose", "Warm saline gargle", "Steam inhalation"],
        "prevention": ["Hand hygiene", "Avoid touching face", "Adequate sleep", "Balanced nutrition"],
        "lifestyle": ["Warm soups and fluids", "Rest for 2-3 days", "Honey with warm water", "Avoid cold foods"],
        "followup": "Self-care usually sufficient; visit doctor if symptoms > 10 days",
        "specialist": "General Physician"
    },
    "Stroke": {
        "treatments": ["EMERGENCY: Call ambulance immediately", "Clot-busting medication (tPA) within window", "Blood thinners as prescribed", "Rehabilitation therapy"],
        "prevention": ["Control BP and sugar", "Quit smoking", "Limit alcohol", "Regular health checkups"],
        "lifestyle": ["Physical therapy sessions", "Speech therapy if needed", "Healthy Mediterranean diet", "Family support system"],
        "followup": "Neurologist every month initially; rehab assessment regularly",
        "specialist": "Neurologist"
    },
    "Pneumonia": {
        "treatments": ["Antibiotics as prescribed (bacterial)", "Rest and oxygen therapy if needed", "Fever management", "Follow-up chest X-ray"],
        "prevention": ["Pneumococcal and flu vaccines", "Quit smoking", "Hand hygiene", "Good nutrition"],
        "lifestyle": ["Complete antibiotic course", "Deep breathing exercises", "Adequate hydration", "Gradual activity increase"],
        "followup": "Chest X-ray after 6 weeks to confirm resolution",
        "specialist": "Pulmonologist"
    },
    "Dengue Fever": {
        "treatments": ["Hydration is critical (ORS/IV)", "Paracetamol only (AVOID ibuprofen/aspirin)", "Platelet count monitoring daily", "Complete rest"],
        "prevention": ["Mosquito control measures", "Use repellents and nets", "Eliminate standing water", "Wear full-sleeve clothing"],
        "lifestyle": ["Papaya leaf extract (traditional support)", "Coconut water", "Avoid oily foods", "Rest for 7-10 days"],
        "followup": "Daily platelet check until recovery; ER if bleeding gums or petechiae",
        "specialist": "General Physician"
    },
    "Malaria": {
        "treatments": ["Antimalarial drugs (as prescribed)", "Fever management", "Hydration", "Complete medication course"],
        "prevention": ["Mosquito nets and repellents", "Prophylaxis before travel to endemic areas", "Eliminate breeding sites", "Protective clothing"],
        "lifestyle": ["Rest during fever spikes", "Fluid replacement", "Nutritious diet for recovery", "Avoid alcohol"],
        "followup": "Repeat blood smear after treatment to confirm cure",
        "specialist": "General Physician"
    },
    "Tuberculosis": {
        "treatments": ["DOTS therapy (6-9 months)", "Never miss doses", "Regular sputum tests", "Nutritional support"],
        "prevention": ["BCG vaccination", "Avoid close contact during active phase", "Good ventilation", "Cover mouth when coughing"],
        "lifestyle": ["High protein diet", "Complete rest initially", "No smoking/alcohol", "Family screening"],
        "followup": "Monthly doctor visits through entire treatment course",
        "specialist": "Pulmonologist"
    },
    "Depression": {
        "treatments": ["Psychotherapy (CBT)", "Antidepressants if prescribed", "Support groups", "Routine building"],
        "prevention": ["Strong social connections", "Regular exercise", "Sleep hygiene", "Stress management"],
        "lifestyle": ["Daily 30 min outdoor walk", "Journaling", "Limit social media", "Mindfulness practice"],
        "followup": "Psychiatrist every 2-4 weeks initially",
        "specialist": "Psychiatrist"
    },
    "Anxiety Disorders": {
        "treatments": ["Cognitive Behavioral Therapy", "Anti-anxiety medication if prescribed", "Breathing retraining", "Gradual exposure therapy"],
        "prevention": ["Regular meditation", "Limit caffeine", "Exercise routine", "Adequate sleep"],
        "lifestyle": ["Deep breathing exercises daily", "Yoga and pranayama", "Reduce stimulants", "Maintain routines"],
        "followup": "Therapist sessions weekly/biweekly",
        "specialist": "Psychiatrist"
    },
    "Osteoporosis": {
        "treatments": ["Calcium and Vitamin D supplements", "Bisphosphonates if prescribed", "Weight-bearing exercises", "Bone density (DEXA) scan"],
        "prevention": ["Adequate calcium intake (1000-1200mg)", "Vitamin D from sunlight", "Weight-bearing activity", "Limit alcohol"],
        "lifestyle": ["Fall-proof home", "Avoid smoking", "Strength training 2x/week", "Balanced protein diet"],
        "followup": "DEXA scan every 2 years",
        "specialist": "Orthopedist"
    },
    "Eczema": {
        "treatments": ["Moisturize frequently", "Topical corticosteroid creams", "Avoid scratching", "Antihistamines for itching"],
        "prevention": ["Identify triggers (soaps, detergents)", "Lukewarm baths", "Cotton clothing", "Humidifier in dry rooms"],
        "lifestyle": ["Fragrance-free skincare", "Regular moisturizing routine", "Stress management", "Shorter showers"],
        "followup": "Dermatologist if flares persist > 2 weeks",
        "specialist": "Dermatologist"
    },
    "Psoriasis": {
        "treatments": ["Topical steroids and vitamin D analogs", "Phototherapy (UVB)", "Moisturizers", "Systemic medication if severe"],
        "prevention": ["Avoid skin injury", "Stress management", "Limit alcohol", "Avoid certain medications"],
        "lifestyle": ["Regular moisturizing", "Balanced omega-3 diet", "Maintain healthy weight", "No smoking"],
        "followup": "Dermatologist every 1-3 months",
        "specialist": "Dermatologist"
    },
    "Hepatitis": {
        "treatments": ["Antiviral therapy as prescribed", "Absolute alcohol avoidance", "Liver function monitoring", "Adequate rest"],
        "prevention": ["Vaccination (Hep A & B)", "Safe food and water", "Avoid sharing needles/razors", "Safe practices"],
        "lifestyle": ["Low-fat diet", "Avoid hepatotoxic drugs", "Regular LFT tests", "Small frequent meals"],
        "followup": "Hepatologist/liver function tests every 3 months",
        "specialist": "Gastroenterologist"
    },
    "Chronic Kidney Disease": {
        "treatments": ["BP and sugar control", "Nephrology-prescribed medications", "Dietary protein modification", "Regular creatinine monitoring"],
        "prevention": ["Stay hydrated", "Avoid nephrotoxic painkillers", "Control diabetes/BP", "Regular kidney function tests"],
        "lifestyle": ["Low salt diet", "Moderate protein", "No smoking", "Weight management"],
        "followup": "Nephrologist every 1-3 months based on stage",
        "specialist": "Nephrologist"
    },
    "Coronary Artery Disease": {
        "treatments": ["Aspirin/statins as prescribed", "Nitroglycerin for chest pain", "Cardiac rehabilitation", "Possibly stent/bypass"],
        "prevention": ["Cholesterol control", "Quit smoking", "BP management", "Diabetes control"],
        "lifestyle": ["Mediterranean diet", "Daily 30 min walking", "Stress reduction", "Weight control"],
        "followup": "Cardiologist every 3-6 months; ER if chest pain at rest",
        "specialist": "Cardiologist"
    },
    "Urinary Tract Infection": {
        "treatments": ["Antibiotics full course", "Increased water intake", "Urinary alkalizers", "Pain relief if needed"],
        "prevention": ["Drink 2-3L water daily", "Urinate after intercourse", "Proper hygiene front-to-back", "Avoid holding urine"],
        "lifestyle": ["Cranberry juice (unsweetened)", "Cotton underwear", "Avoid irritants (caffeine)", "Regular urination"],
        "followup": "Urine culture after treatment; doctor if recurrent",
        "specialist": "Urologist"
    },
    "Gastroenteritis": {
        "treatments": ["Oral rehydration solution", "Bland diet (BRAT)", "Probiotics", "Anti-diarrheal if advised"],
        "prevention": ["Hand hygiene", "Safe food preparation", "Clean drinking water", "Avoid street food in outbreaks"],
        "lifestyle": ["Small frequent meals", "Avoid dairy temporarily", "Gradual diet normalcy", "Rest"],
        "followup": "Doctor if dehydration signs or blood in stool",
        "specialist": "General Physician"
    },
    "Thyroid Disease": {
        "treatments": ["Thyroid hormone replacement (hypothyroid)", "Antithyroid meds (hyperthyroid)", "Regular TSH testing", "Iodine-appropriate diet"],
        "prevention": ["Adequate iodine intake", "Avoid excessive soy", "Regular checkups", "Manage stress"],
        "lifestyle": ["Selenium-rich foods", "Regular exercise", "Sleep 7-8 hours", "Medication on empty stomach"],
        "followup": "TSH every 6-8 weeks until stable, then 6 monthly",
        "specialist": "Endocrinologist"
    },
    "Breast Cancer": {
        "treatments": ["Oncology team evaluation", "Surgery/chemo/radiation as planned", "Hormone therapy if receptor-positive", "Supportive care"],
        "prevention": ["Monthly self-breast exam", "Annual mammogram after 40", "Maintain healthy weight", "Breastfeed if possible"],
        "lifestyle": ["Balanced diet", "Limit alcohol", "Stay active", "Support group participation"],
        "followup": "Oncologist per treatment protocol",
        "specialist": "Oncologist"
    }
}

CATEGORY_RULES = [
    (["cancer", "tumor", "carcinoma", "leukemia", "lymphoma", "melanoma", "sarcoma", "myeloma"], {
        "treatments": ["Oncologist consultation urgently", "Staging and biopsy evaluation", "Treatment plan (surgery/chemo/radiation)", "Palliative care if advanced"],
        "prevention": ["Avoid tobacco completely", "Regular cancer screening", "Healthy weight maintenance", "Limit alcohol"],
        "lifestyle": ["Nutritious high-protein diet", "Gentle exercise as tolerated", "Emotional support system", "Join cancer support groups"],
        "followup": "Oncologist as per protocol",
        "specialist": "Oncologist"
    }),
    (["heart", "cardiac", "coronary", "aortic", "arrhythmia", "myocardial", "angina"], {
        "treatments": ["Cardiology evaluation", "ECG/Echo as advised", "Prescribed cardiac medications", "Lipid management"],
        "prevention": ["Control BP, sugar, cholesterol", "Quit smoking", "Heart-healthy diet", "Regular activity"],
        "lifestyle": ["Low sodium diet", "Daily walking", "Stress management", "Limit alcohol"],
        "followup": "Cardiologist every 3-6 months",
        "specialist": "Cardiologist"
    }),
    (["pneumonia", "infection", "sepsis", "tuberculosis", "flu", "cold", "virus", "hepatitis", "malaria", "dengue", "measles", "chickenpox", "mumps", "rubella", "cholera", "typhoid", "rabies", "zika", "ebola", "anthrax"], {
        "treatments": ["Appropriate antimicrobial therapy", "Hydration and rest", "Fever management", "Monitor for complications"],
        "prevention": ["Vaccinations up to date", "Hand hygiene", "Safe food/water", "Avoid sick contacts"],
        "lifestyle": ["Complete medication course", "Nutritious diet", "Adequate rest", "Gradual activity return"],
        "followup": "Review if not improving in 3-5 days",
        "specialist": "General Physician"
    }),
    (["asthma", "bronchitis", "copd", "pulmonary", "lung", "respiratory", "empyema", "pneumothorax"], {
        "treatments": ["Bronchodilator therapy", "Inhaled corticosteroids", "Oxygen if needed", "Pulmonary rehab"],
        "prevention": ["Avoid smoke and pollutants", "Annual flu shot", "Trigger identification", "Indoor air quality"],
        "lifestyle": ["Breathing exercises", "Regular moderate exercise", "Maintain healthy weight", "Humidification"],
        "followup": "Pulmonologist every 6 months",
        "specialist": "Pulmonologist"
    }),
    (["anxiety", "depression", "bipolar", "schizophrenia", "insomnia", "autism", "adhd", "panic", "phobia", "disorder"], {
        "treatments": ["Psychotherapy (CBT/DBT)", "Psychiatric medication if prescribed", "Behavioral therapy", "Family counseling"],
        "prevention": ["Strong support network", "Sleep hygiene", "Stress management", "Regular routine"],
        "lifestyle": ["Daily exercise", "Meditation/mindfulness", "Limit alcohol/caffeine", "Journaling"],
        "followup": "Mental health professional every 2-4 weeks",
        "specialist": "Psychiatrist"
    }),
    (["arthritis", "osteoporosis", "fracture", "joint", "back", "spine", "scoliosis", "muscular", "osteomyelitis", "gout"], {
        "treatments": ["Pain management (NSAIDs)", "Physical therapy", "Joint protection techniques", "Disease-specific medication"],
        "prevention": ["Calcium/Vitamin D adequacy", "Weight management", "Fall prevention", "Proper posture"],
        "lifestyle": ["Low-impact exercise (swimming)", "Anti-inflammatory diet", "Warm compresses", "Assistive devices if needed"],
        "followup": "Orthopedist every 3-6 months",
        "specialist": "Orthopedist"
    }),
    (["brain", "seizure", "epilepsy", "stroke", "alzheimer", "dementia", "parkinson", "neural", "encephalitis", "meningitis", "headache", "concussion"], {
        "treatments": ["Neurological evaluation", "Antiepileptics if seizures", "Imaging as advised (MRI/CT)", "Rehabilitation if needed"],
        "prevention": ["BP and sugar control", "Head injury prevention", "Limit alcohol", "Regular checkups"],
        "lifestyle": ["Regular sleep schedule", "Stress management", "Safe physical activity", "Medication adherence"],
        "followup": "Neurologist every 3 months",
        "specialist": "Neurologist"
    }),
    (["stomach", "gastr", "ulcer", "colitis", "crohn", "intestin", "hernia", "appendicitis", "diverticul", "constipation", "diarrhea", "esophag"], {
        "treatments": ["Gastroenterology evaluation", "Acid suppression therapy", "Dietary modification", "Endoscopy if advised"],
        "prevention": ["Avoid NSAIDs overuse", "Limit spicy/oily food", "No smoking", "Manage stress"],
        "lifestyle": ["Small frequent meals", "Chew food well", "Avoid late-night eating", "Probiotic foods"],
        "followup": "Gastroenterologist if symptoms persist 2 weeks",
        "specialist": "Gastroenterologist"
    }),
    (["skin", "dermat", "eczema", "psoriasis", "acne", "rash", "hive", "herpes", "cellulitis", "impetigo"], {
        "treatments": ["Topical treatments as prescribed", "Antihistamines for itching", "Antibiotics if infected", "Phototherapy if needed"],
        "prevention": ["Gentle skincare routine", "Avoid known irritants", "Sun protection", "Keep skin moisturized"],
        "lifestyle": ["Fragrance-free products", "Cotton clothing", "Lukewarm baths", "Stress management"],
        "followup": "Dermatologist if not improving in 2 weeks",
        "specialist": "Dermatologist"
    }),
    (["eye", "vision", "glaucoma", "cataract", "conjunctivitis", "retina", "myopia"], {
        "treatments": ["Ophthalmology evaluation", "Prescription correction", "Eye drops as advised", "Surgery if indicated"],
        "prevention": ["Regular eye checkups", "20-20-20 screen rule", "UV protection sunglasses", "Good lighting"],
        "lifestyle": ["Vitamin A rich foods", "Limit screen time", "Eye exercises", "Proper hygiene"],
        "followup": "Ophthalmologist annually",
        "specialist": "Ophthalmologist"
    }),
    (["kidney", "renal", "nephro", "bladder", "urinary", "cystitis", "prostate", "ureth"], {
        "treatments": ["Nephrology/urology evaluation", "Fluid management", "Stone-expelling or surgical options", "Infection treatment"],
        "prevention": ["Adequate hydration", "Limit salt and oxalate foods", "Don't hold urine", "Treat infections promptly"],
        "lifestyle": ["2-3L water daily", "Balanced diet", "Regular voiding", "Avoid smoking"],
        "followup": "Urologist/nephrologist as advised",
        "specialist": "Urologist"
    })
]

GENERAL_TREATMENT = {
    "treatments": ["Consult physician for proper diagnosis", "Symptomatic management", "Follow prescribed medication", "Monitor symptoms"],
    "prevention": ["Healthy lifestyle habits", "Regular health checkups", "Balanced nutrition", "Adequate hydration"],
    "lifestyle": ["Regular exercise 30 min/day", "7-8 hours sleep", "Stress management", "Avoid smoking/alcohol"],
    "followup": "Visit doctor if symptoms persist or worsen",
    "specialist": "General Physician"
}


def get_treatment_recommendations(disease_name):
    d = str(disease_name).lower()

    # 1. Exact match
    for key, val in DISEASE_TREATMENTS.items():
        if d == key.lower():
            rec = dict(val)
            rec["disease"] = disease_name
            rec["matched"] = "exact"
            return rec

    # 2. Partial match
    for key, val in DISEASE_TREATMENTS.items():
        if key.lower() in d or d in key.lower():
            rec = dict(val)
            rec["disease"] = disease_name
            rec["matched"] = "close"
            return rec

    # 3. Category match
    for keywords, val in CATEGORY_RULES:
        for kw in keywords:
            if kw in d:
                rec = dict(val)
                rec["disease"] = disease_name
                rec["matched"] = "category"
                return rec

    # 4. General fallback
    rec = dict(GENERAL_TREATMENT)
    rec["disease"] = disease_name
    rec["matched"] = "general"
    return rec


# ============================================================
# RISK ENGINE
# ============================================================

class SymptomInput(BaseModel):
    symptoms: List[str] = []
    age: int = 30
    gender: str = "Male"
    blood_pressure: str = "Normal"
    cholesterol: str = "Normal"


def build_input(symptoms: List[str]):
    data = {col: 0 for col in feature_columns}
    matched = []
    for s in symptoms:
        if s in data:
            data[s] = 1
            matched.append(s)
    return pd.DataFrame([data], columns=feature_columns), matched


def calculate_severity(symptom_count, total_symptoms, age, bp, chol):
    score = 0
    if total_symptoms > 0:
        score += min((symptom_count / total_symptoms) * 200, 40)
    if age >= 60:
        score += 25
    elif age >= 40:
        score += 15
    elif age >= 25:
        score += 5
    score += {"High": 20, "Low": 10, "Normal": 0}.get(str(bp), 5)
    score += {"High": 20, "Low": 5, "Normal": 0}.get(str(chol), 5)
    if symptom_count >= 10:
        score += 10
    elif symptom_count >= 5:
        score += 5
    return min(score, 100)


def get_risk_category(score):
    if score >= 75:
        return "Critical"
    elif score >= 50:
        return "High"
    elif score >= 25:
        return "Moderate"
    return "Low"


def get_risk_recommendations(category):
    recs = {
        "Critical": ["SEEK IMMEDIATE MEDICAL ATTENTION", "Call emergency services (911/108)", "Go to nearest hospital immediately", "Monitor vital signs continuously"],
        "High": ["Schedule urgent doctor appointment within 24 hours", "Monitor symptoms closely", "Avoid physical exertion", "Keep emergency contacts ready"],
        "Moderate": ["Schedule doctor appointment within 1 week", "Rest and stay hydrated", "Monitor for worsening symptoms"],
        "Low": ["Monitor symptoms at home", "Maintain healthy lifestyle", "Schedule routine check-up if concerned"]
    }
    return recs.get(category, recs["Low"])


def run_prediction(symptoms, age, gender, bp, chol):
    input_df, matched = build_input(symptoms)
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

    symptom_count = len(matched)
    severity = calculate_severity(symptom_count, len(feature_columns), age, bp, chol)
    risk_cat = get_risk_category(severity)

    treatment = get_treatment_recommendations(predicted_disease)

    return {
        "report_id": "MA-" + datetime.now().strftime("%Y%m%d-%H%M%S"),
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "patient": {
            "symptoms": matched,
            "age": age,
            "gender": gender,
            "blood_pressure": bp,
            "cholesterol": chol
        },
        "prediction": {
            "predicted_disease": str(predicted_disease),
            "confidence": top_preds[0]["probability"],
            "top_predictions": top_preds
        },
        "risk": {
            "severity_score": round(float(severity), 2),
            "risk_category": risk_cat,
            "is_emergency": severity >= 75,
            "symptom_count": symptom_count
        },
        "treatment": treatment,
        "recommendations": get_risk_recommendations(risk_cat)
    }


# ============================================================
# PREDICTION APIs
# ============================================================

@app.get("/")
def root():
    return {"message": "MedAssist AI API v3 running!", "total_symptoms": len(feature_columns)}


@app.get("/symptoms")
def get_symptoms():
    if not feature_columns:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {"total": len(feature_columns), "symptoms": feature_columns}


@app.get("/model-info")
def get_model_info():
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    info = {
        "model_type": type(model).__name__,
        "total_diseases": len(disease_encoder.classes_),
        "total_symptoms": len(feature_columns),
        "model_metrics": model_metrics
    }
    if risk_config:
        info["best_model"] = risk_config.get("best_model", "Unknown")
        info["accuracy"] = risk_config.get("best_accuracy", 0)
    return info


@app.post("/predict")
def predict(data: SymptomInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    if not data.symptoms:
        raise HTTPException(status_code=400, detail="Select at least 1 symptom")
    r = run_prediction(data.symptoms, data.age, data.gender, data.blood_pressure, data.cholesterol)
    return {
        "predicted_disease": r["prediction"]["predicted_disease"],
        "confidence": r["prediction"]["confidence"],
        "top_predictions": r["prediction"]["top_predictions"],
        "treatment": r["treatment"]
    }


@app.post("/full-report")
def full_report(data: SymptomInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    if not data.symptoms:
        raise HTTPException(status_code=400, detail="Select at least 1 symptom")
    result = run_prediction(data.symptoms, data.age, data.gender, data.blood_pressure, data.cholesterol)

    # Save latest report
    os.makedirs("reports", exist_ok=True)
    with open("reports/latest_report.json", "w") as f:
        json.dump(result, f, indent=2, default=str)

    # Log for analytics
    log = load_log()
    log.append({
        "timestamp": result["generated_at"],
        "report_id": result["report_id"],
        "disease": result["prediction"]["predicted_disease"],
        "confidence": result["prediction"]["confidence"],
        "risk_category": result["risk"]["risk_category"],
        "severity": result["risk"]["severity_score"],
        "symptoms": result["patient"]["symptoms"],
        "age": data.age,
        "gender": data.gender
    })
    save_log(log)

    return result


@app.get("/treatment/{disease}")
def treatment_for_disease(disease: str):
    return get_treatment_recommendations(disease)


@app.post("/risk-assessment")
def risk_api(data: SymptomInput):
    severity = calculate_severity(len(data.symptoms), len(feature_columns), data.age, data.blood_pressure, data.cholesterol)
    cat = get_risk_category(severity)
    return {
        "severity_score": round(severity, 2),
        "risk_category": cat,
        "is_emergency": severity >= 75,
        "symptom_count": len(data.symptoms),
        "recommendations": get_risk_recommendations(cat)
    }


# ============================================================
# ANALYTICS APIs (Milestone 3)
# ============================================================

@app.get("/analytics/summary")
def analytics_summary():
    log = load_log()

    risk_dist = {}
    disease_freq = {}
    symptom_freq = {}
    daily_trend = {}
    total_severity = 0

    for entry in log:
        rc = entry.get("risk_category", "Low")
        risk_dist[rc] = risk_dist.get(rc, 0) + 1

        dis = entry.get("disease", "Unknown")
        disease_freq[dis] = disease_freq.get(dis, 0) + 1

        for s in entry.get("symptoms", []):
            symptom_freq[s] = symptom_freq.get(s, 0) + 1

        day = str(entry.get("timestamp", ""))[:10]
        daily_trend[day] = daily_trend.get(day, 0) + 1

        total_severity += entry.get("severity", 0)

    total = len(log)
    top_diseases = sorted(disease_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    top_symptoms = sorted(symptom_freq.items(), key=lambda x: x[1], reverse=True)[:15]
    trend = sorted(daily_trend.items())

    # Model info
    acc = risk_config.get("best_accuracy", 0) if risk_config else 0
    best = risk_config.get("best_model", "N/A") if risk_config else "N/A"

    return {
        "total_predictions": total,
        "avg_severity": round(total_severity / total, 2) if total > 0 else 0,
        "critical_cases": risk_dist.get("Critical", 0),
        "emergency_rate": round((risk_dist.get("Critical", 0) / total) * 100, 1) if total > 0 else 0,
        "risk_distribution": risk_dist,
        "top_diseases": [{"disease": d, "count": c} for d, c in top_diseases],
        "top_symptoms": [{"symptom": s, "count": c} for s, c in top_symptoms],
        "daily_trend": [{"date": d, "count": c} for d, c in trend],
        "model": {"best_model": best, "accuracy": acc, "total_symptoms": len(feature_columns)},
        "recent_predictions": log[-15:][::-1]
    }


@app.get("/analytics/export", response_class=PlainTextResponse)
def analytics_export():
    log = load_log()
    lines = ["timestamp,report_id,disease,confidence,risk_category,severity,age,gender,symptoms"]
    for e in log:
        lines.append(",".join([
            str(e.get("timestamp", "")),
            str(e.get("report_id", "")),
            '"' + str(e.get("disease", "")) + '"',
            str(e.get("confidence", 0)),
            str(e.get("risk_category", "")),
            str(e.get("severity", 0)),
            str(e.get("age", "")),
            str(e.get("gender", "")),
            '"' + "; ".join(e.get("symptoms", [])) + '"'
        ]))
    return "\n".join(lines)


@app.get("/health-risk-report")
def get_health_risk_report():
    try:
        with open("reports/health_risk_report.json", "r") as f:
            return json.load(f)
    except:
        raise HTTPException(status_code=404, detail="Run train_model.py first")


@app.get("/latest-report")
def get_latest_report():
    try:
        with open("reports/latest_report.json", "r") as f:
            return json.load(f)
    except:
        raise HTTPException(status_code=404, detail="No report found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)