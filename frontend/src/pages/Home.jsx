import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

function Home(){

const navigate=useNavigate();

return(

<>
<Navbar/>

<div className="hero">

<h1>🏥 MedAssist AI</h1>

<p>AI Powered Medical Symptom Analysis & Disease Prediction Platform</p>

<button
className="btn loginBtn"
onClick={()=>navigate("/login")}
>
Login
</button>

<button
className="btn registerBtn"
onClick={()=>navigate("/register")}
>
Register
</button>

</div>

<div className="stats">

<div className="stat-card">
<h2>1500+</h2>
Patients
</div>

<div className="stat-card">
<h2>50+</h2>
Doctors
</div>

<div className="stat-card">
<h2>98%</h2>
AI Accuracy
</div>

<div className="stat-card">
<h2>10000+</h2>
Reports
</div>

</div>

<div className="services">

<h2>Our Services</h2>

<div className="service-grid">

<div className="service-card">
<h1>🩺</h1>
<h3>Symptoms Analysis</h3>
<p>Analyze symptoms using AI.</p>
</div>

<div className="service-card">
<h1>🤖</h1>
<h3>Disease Prediction</h3>
<p>Predict diseases using Machine Learning.</p>
</div>

<div className="service-card">
<h1>💊</h1>
<h3>Medicine Recommendation</h3>
<p>AI suggests medicines.</p>
</div>

<div className="service-card">
<h1>📄</h1>
<h3>Medical Reports</h3>
<p>Upload and analyze reports.</p>
</div>

<div className="service-card">
<h1>❤️</h1>
<h3>Health Monitoring</h3>
<p>Track your health metrics.</p>
</div>

<div className="service-card">
<h1>👨‍⚕️</h1>
<h3>Doctor Consultation</h3>
<p>Consult healthcare professionals.</p>
</div>

</div>

</div>

<div className="footer">

<h3>🏥 MedAssist AI</h3>

<p>AI Powered Healthcare Platform</p>

<p>© 2026 All Rights Reserved</p>

</div>

</>

);

}

export default Home;