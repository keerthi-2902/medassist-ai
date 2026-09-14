import Navbar from "../components/Navbar";

function PatientProfile() {
  return (
    <div>
      <Navbar />

      <div
        style={{
          width: "700px",
          margin: "40px auto",
          padding: "30px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#0077b6" }}>
          Patient Profile
        </h1>

        <table
          style={{
            width: "100%",
            marginTop: "20px",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td><b>Name</b></td>
              <td>John Doe</td>
            </tr>

            <tr>
              <td><b>Age</b></td>
              <td>24</td>
            </tr>

            <tr>
              <td><b>Gender</b></td>
              <td>Male</td>
            </tr>

            <tr>
              <td><b>Blood Group</b></td>
              <td>O+</td>
            </tr>

            <tr>
              <td><b>Phone</b></td>
              <td>9876543210</td>
            </tr>

            <tr>
              <td><b>Email</b></td>
              <td>john@example.com</td>
            </tr>

            <tr>
              <td><b>Address</b></td>
              <td>Hyderabad</td>
            </tr>

            <tr>
              <td><b>Emergency Contact</b></td>
              <td>9876543211</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PatientProfile;