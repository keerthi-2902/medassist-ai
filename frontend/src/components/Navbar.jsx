import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#0077b6",
        color: "white",
        padding: "15px 40px",
      }}
    >
      <h2>🏥 MedAssist AI</h2>

      <div>
        <Link
          to="/"
          style={{
            color: "white",
            marginRight: "20px",
          }}
        >
          Home
        </Link>

        <Link
          to="/login"
          style={{
            color: "white",
            marginRight: "20px",
          }}
        >
          Login
        </Link>

        <Link
          to="/register"
          style={{
            color: "white",
          }}
        >
          Register
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;