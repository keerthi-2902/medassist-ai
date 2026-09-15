import pandas as pd
import numpy as np
import joblib
import os
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
from collections import Counter

print("=" * 50)
print("  Creating LIGHTWEIGHT model for deployment")
print("=" * 50)

df_train = pd.read_csv("../datasets/trainings.csv", encoding="latin1")
df_test = pd.read_csv("../datasets/testing.csv", encoding="latin1")

for df in [df_train, df_test]:
    df.columns = df.columns.astype(str).str.replace("\xa0", " ", regex=False).str.strip()

target = "Prognosis"
X_train = df_train.drop(columns=[target])
y_train = df_train[target]
X_test = df_test.drop(columns=[target])
y_test = df_test[target]

common_cols = [c for c in X_train.columns if c in X_test.columns]
X_train = X_train[common_cols]
X_test = X_test[common_cols]

for col in common_cols:
    try:
        X_train[col] = pd.to_numeric(X_train[col], errors="raise").astype(int)
        X_test[col] = pd.to_numeric(X_test[col], errors="raise").astype(int)
    except:
        le = LabelEncoder()
        combined = pd.concat([X_train[col], X_test[col]]).astype(str)
        le.fit(combined)
        X_train[col] = le.transform(X_train[col].astype(str))
        X_test[col] = le.transform(X_test[col].astype(str))

disease_encoder = LabelEncoder()
y_train = disease_encoder.fit_transform(y_train.astype(str))

mask = y_test.astype(str).isin(disease_encoder.classes_)
X_test = X_test[mask]
y_test = y_test[mask]
y_test = disease_encoder.transform(y_test.astype(str))

X_all = pd.concat([X_train, X_test], ignore_index=True)
y_all = np.concatenate([y_train, y_test])
counts = Counter(y_all)

aug_X, aug_y = [], []
for disease_id, count in counts.items():
    if count < 50:
        existing = X_all[y_all == disease_id]
        needed = 50 - count
        for _ in range(needed):
            idx = np.random.randint(0, len(existing))
            sample = existing.iloc[idx].copy()
            noise_cols = np.random.choice(common_cols, size=min(3, len(common_cols)), replace=False)
            for col in noise_cols:
                sample[col] = 1 - sample[col]
            aug_X.append(sample)
            aug_y.append(disease_id)

if aug_X:
    X_all = pd.concat([X_all, pd.DataFrame(aug_X, columns=common_cols)], ignore_index=True)
    y_all = np.concatenate([y_all, aug_y])

print("Total samples: " + str(len(X_all)))

model = XGBClassifier(
    n_estimators=60,
    max_depth=5,
    learning_rate=0.15,
    random_state=42,
    eval_metric="mlogloss",
    verbosity=0
)

model.fit(X_all, y_all)

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
Xtr, Xte, ytr, yte = train_test_split(X_all, y_all, test_size=0.2, random_state=42)
acc = accuracy_score(yte, model.predict(Xte))
print("Lightweight Model Accuracy: " + str(round(acc * 100, 2)) + "%")

joblib.dump(model, "models/disease_model.pkl", compress=3)
joblib.dump(disease_encoder, "models/disease_encoder.pkl", compress=3)

risk_config = {
    "best_model": "XGBoost-Light",
    "best_accuracy": round(acc * 100, 2),
    "feature_columns": common_cols,
    "total_features": len(common_cols),
    "thresholds": {"critical": 75, "high": 50, "moderate": 25, "low": 0}
}
joblib.dump(risk_config, "models/risk_config.pkl", compress=3)

size = os.path.getsize("models/disease_model.pkl") / (1024 * 1024)
print("New model size: " + str(round(size, 1)) + " MB")
print("DONE! Now push to GitHub!")