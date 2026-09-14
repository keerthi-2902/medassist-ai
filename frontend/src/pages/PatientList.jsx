import Navbar from "../components/Navbar";

function Prescription() {
  return (
    <div>
      <Navbar />

      <div
        style={{
          width: "600px",
          margin: "40px auto",
          padding: "30px",
          boxShadow: "0 2px 10px rgba(0,0,0,.2)",
        }}
      >
        <h1>💊 Prescription</h1>

        <input
          placeholder="Patient Name"
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <textarea
          placeholder="Medicines"
          rows="4"
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <textarea
          placeholder="Doctor Instructions"
          rows="4"
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <button
          style={{
            padding: "10px 30px",
            background: "#0077b6",
            color: "white",
            border: "none",
          }}
        >
          Save Prescription
        </button>
      </div>
    </div>
  );
}

export default Prescription;