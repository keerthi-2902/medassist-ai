import Navbar from "../components/Navbar";

function MedicalHistory() {
  return (
    <div>
      <Navbar />

      <div
        style={{
          width: "800px",
          margin: "40px auto",
          padding: "30px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#0077b6" }}>
          Medical History
        </h1>

        <table
          border="1"
          cellPadding="10"
          style={{
            width: "100%",
            marginTop: "20px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Date</th>
              <th>Disease</th>
              <th>Doctor</th>
              <th>Medicine</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>12-06-2026</td>
              <td>Fever</td>
              <td>Dr. Smith</td>
              <td>Paracetamol</td>
              <td>Recovered</td>
            </tr>

            <tr>
              <td>21-05-2026</td>
              <td>Cold</td>
              <td>Dr. Rahul</td>
              <td>Cetirizine</td>
              <td>Recovered</td>
            </tr>

            <tr>
              <td>03-04-2026</td>
              <td>Headache</td>
              <td>Dr. Kumar</td>
              <td>Ibuprofen</td>
              <td>Recovered</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MedicalHistory;