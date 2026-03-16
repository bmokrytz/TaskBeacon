import { useState } from "react";

const API_BASE = "http://localhost:8000";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");       // replaces alert()
  const [loading, setLoading] = useState(false); // disables button while waiting





  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Login failed. Please check your email and password.");
        localStorage.removeItem("login_email");
        return;
      }

      const data = await res.json();
      const token = data.access_token || data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("login_email", email);

      // In a full React app with React Router you'd use:
      //   navigate("/tasks")
      // For now this works fine:
      window.location.href = "/tasks.html";

    } catch (err) {
      // Catches network errors
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }





  return (
    <div style={styles.page}>

      {/* Decorative background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* Register button — top right */}
      <div style={styles.topBar}>
        <button
          style={styles.registerBtn}
          onClick={() => window.location.href = "/register"}
        >
          Register
        </button>
      </div>

      {/* Login card container */}
      <div style={styles.card}>

        {/* Logo / title area */}
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>◈</div>
          <h1 style={styles.appName}>Task Beacon</h1>
          <p style={styles.tagline}>Sign in to your workspace</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Email input field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="email">
              Email
            </label>
            {}
            <input
              id="email"
              type="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              required
            />
          </div>

          {/* Password input field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Submit button - Has alternative loading state. */}
          <button
            type="submit"
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>
      </div>
    </div>
  );
}




const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f1117",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Palatino Linotype', Palatino, serif",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "fixed",
    top: "-150px", right: "-150px",
    width: "500px", height: "500px",
    background: "radial-gradient(circle, #3b82f633 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  blob2: {
    position: "fixed",
    bottom: "-150px", left: "-150px",
    width: "400px", height: "400px",
    background: "radial-gradient(circle, #0ea5e933 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  topBar: {
    position: "fixed",
    top: "24px", right: "32px",
    zIndex: 10,
  },
  registerBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#94a3b8",
    padding: "10px 22px",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    letterSpacing: "0.04em",
    transition: "all 0.2s",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "52px 48px",
    width: "100%",
    maxWidth: "440px",
    position: "relative",
    zIndex: 1,
    backdropFilter: "blur(12px)",
  },
  logoArea: {
    textAlign: "center",
    marginBottom: "40px",
  },
  logoIcon: {
    fontSize: "36px",
    color: "#3b82f6",
    marginBottom: "12px",
  },
  appName: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#f1f5f9",
    margin: "0 0 8px",
    letterSpacing: "-0.02em",
  },
  tagline: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },
  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "14px",
    marginBottom: "24px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "14px 16px",
    fontSize: "16px",
    color: "#f1f5f9",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
    border: "none",
    borderRadius: "10px",
    padding: "15px",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    cursor: "pointer",
    letterSpacing: "0.03em",
    marginTop: "8px",
    transition: "opacity 0.2s",
  },
};
