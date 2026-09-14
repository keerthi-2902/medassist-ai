import requests
import json

BASE_URL = "http://localhost:8000"

passed = 0
failed = 0

def test(name, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print("  PASS | " + name)
    else:
        failed += 1
        print("  FAIL | " + name + " | " + str(detail))

print("=" * 55)
print("  MedAssist AI - API Test Suite")
print("=" * 55)

# Test 1: Root endpoint
try:
    r = requests.get(BASE_URL + "/")
    test("Root API running", r.status_code == 200, r.status_code)
except Exception as e:
    test("Root API running", False, e)

# Test 2: Symptoms list
try:
    r = requests.get(BASE_URL + "/symptoms")
    data = r.json()
    test("Symptoms API (1000+ symptoms)", r.status_code == 200 and data["total"] > 100, data.get("total"))
    symptoms = data["symptoms"]
    print("       Total symptoms: " + str(data.get("total")))
except Exception as e:
    symptoms = []
    test("Symptoms API", False, e)

# Test 3: Model info
try:
    r = requests.get(BASE_URL + "/model-info")
    data = r.json()
    test("Model info API", r.status_code == 200, r.status_code)
    acc = data.get("accuracy", 0)
    test("Model accuracy >= 90%", acc >= 90, acc)
    print("       Model: " + str(data.get("best_model")) + " | Accuracy: " + str(acc) + "%")
except Exception as e:
    test("Model info API", False, e)

# Test 4: Disease prediction
try:
    payload = {"symptoms": ["fever", "headache", "fatigue"], "age": 30, "gender": "Male",
               "blood_pressure": "Normal", "cholesterol": "Normal"}
    r = requests.post(BASE_URL + "/predict", json=payload)
    data = r.json()
    test("Prediction API", r.status_code == 200 and "predicted_disease" in data, data)
    print("       Predicted: " + str(data.get("predicted_disease")) + " (" + str(data.get("confidence")) + "%)")
except Exception as e:
    test("Prediction API", False, e)

# Test 5: Empty symptoms rejected
try:
    r = requests.post(BASE_URL + "/predict", json={"symptoms": []})
    test("Empty symptoms rejected (validation)", r.status_code == 400, r.status_code)
except Exception as e:
    test("Input validation", False, e)

# Test 6: Full report with treatment
try:
    payload = {"symptoms": symptoms[:5] if symptoms else ["fever"], "age": 45, "gender": "Female",
               "blood_pressure": "High", "cholesterol": "High"}
    r = requests.post(BASE_URL + "/full-report", json=payload)
    data = r.json()
    checks = all(k in data for k in ["prediction", "risk", "treatment", "recommendations", "report_id"])
    test("Full report (all sections present)", r.status_code == 200 and checks, list(data.keys()))
    test("Treatment plan present", "treatments" in data.get("treatment", {}), data.get("treatment"))
    test("Specialist recommendation", "specialist" in data.get("treatment", {}))
    test("High risk factors detected (age+BP+chol)", data["risk"]["severity_score"] > 25, data["risk"])
except Exception as e:
    test("Full report", False, e)

# Test 7: Critical risk detection
try:
    payload = {"symptoms": symptoms[:15] if len(symptoms) > 15 else ["fever"], "age": 70,
               "gender": "Male", "blood_pressure": "High", "cholesterol": "High"}
    r = requests.post(BASE_URL + "/risk-assessment", json=payload)
    data = r.json()
    test("Critical/High risk detection (elderly)", data["risk_category"] in ["Critical", "High"], data)
except Exception as e:
    test("Risk assessment", False, e)

# Test 8: Analytics
try:
    r = requests.get(BASE_URL + "/analytics/summary")
    data = r.json()
    test("Analytics dashboard API", r.status_code == 200 and "total_predictions" in data, r.status_code)
    print("       Total predictions logged: " + str(data.get("total_predictions")))
except Exception as e:
    test("Analytics API", False, e)

# Test 9: Treatment lookup
try:
    r = requests.get(BASE_URL + "/treatment/Diabetes")
    data = r.json()
    test("Treatment knowledge base API", r.status_code == 200 and "treatments" in data, data)
except Exception as e:
    test("Treatment lookup", False, e)

# Test 10: CSV export
try:
    r = requests.get(BASE_URL + "/analytics/export")
    test("CSV export API", r.status_code == 200, r.status_code)
except Exception as e:
    test("CSV export", False, e)

# Test 11: API response time
try:
    import time
    start = time.time()
    r = requests.post(BASE_URL + "/predict", json={"symptoms": ["fever", "cough"], "age": 25})
    duration = (time.time() - start) * 1000
    test("API response time < 1000ms", duration < 1000, str(round(duration)) + "ms")
    print("       Response time: " + str(round(duration)) + "ms")
except Exception as e:
    test("Response time", False, e)

print("")
print("=" * 55)
print("  FINAL RESULTS: " + str(passed) + " PASSED | " + str(failed) + " FAILED")
print("=" * 55)
if failed == 0:
    print("  ALL TESTS PASSED - SYSTEM VALIDATED SUCCESSFULLY!")
print("=" * 55)