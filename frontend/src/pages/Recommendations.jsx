import Navbar from "../components/Navbar";

function Recommendations() {
  return (
    <div>
      <Navbar />

      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#0077b6" }}>🤖 AI Health Recommendations</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <div style={cardStyle}>
            <h2>Disease Prediction</h2>
            <p>Viral Fever</p>
          </div>

          <div style={cardStyle}>
            <h2>Recommended Doctor</h2>
            <p>General Physician</p>
          </div>

          <div style={cardStyle}>
            <h2>Suggested Medicines</h2>
            <p>Paracetamol, ORS</p>
          </div>

          <div style={cardStyle}>
            <h2>Risk Level</h2>
            <p>Low</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#fff",
  padding: "25px",
  borderRadius: "10px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
};

export default Recommendations;