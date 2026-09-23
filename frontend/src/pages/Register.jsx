import { useState } from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import "./Login.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password requirement validators (Updated to min 6 letters, number, capital, small, symbol)
  const pwd = form.password;
  const checks = {
    length: pwd.length >= 6,
    lowercase: /[a-z]/.test(pwd),
    uppercase: /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  };

  const isPasswordValid = Object.values(checks).every(Boolean);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Please meet all password requirements.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", form);
      navigate(
        `/verify-email?email=${encodeURIComponent(response.data.email)}`
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Name</label>
            <input
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {/* Clean Eye SVG Icon */}
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </button>
            </div>
          </div>

          {/* Checklist matching image style */}
          <div className="password-checklist">
            <div className={`check-item ${checks.length ? "checked" : ""}`}>
              <span className="radio-bullet"></span> At least 6 characters
            </div>
            <div className={`check-item ${checks.number ? "checked" : ""}`}>
              <span className="radio-bullet"></span> Contains a number
            </div>
            <div className={`check-item ${checks.uppercase ? "checked" : ""}`}>
              <span className="radio-bullet"></span> Contains uppercase letter
            </div>
            <div className={`check-item ${checks.lowercase ? "checked" : ""}`}>
              <span className="radio-bullet"></span> Contains lowercase letter
            </div>
            <div className={`check-item ${checks.symbol ? "checked" : ""}`}>
              <span className="radio-bullet"></span> Contains a symbol
            </div>
          </div>

          <button disabled={loading || !isPasswordValid}>
            {loading ? "Sending OTP..." : "Create Account"}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <p>OR</p>
        <GoogleLoginButton />
      </div>
    </div>
  );
};

export default Register;