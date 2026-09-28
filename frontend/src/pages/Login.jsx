import { useState } from "react";
import { useNavigate,Link} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { accessToken, user } = response.data;

      login(user, accessToken);

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
  <div className="auth-card">
      <div className="auth-brand">
  <div className="auth-logo">F</div>

  <div>
    <h1>Welcome back</h1>
    <p>Sign in to your FixIt account</p>
  </div>
</div>

      <form onSubmit={handleSubmit}>
        <input
           className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="auth-switch">
  Don't have an account?{" "}
  <Link to="/register">Create one</Link>
</p>
    </div>
    </div>
  );
};

export default Login;