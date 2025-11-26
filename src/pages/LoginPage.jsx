import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminPopup, setShowAdminPopup] = useState(false);
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setError("");
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const signupResp = await fetch("http://localhost:2020/back2/users/insert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        });

        const signupText = await signupResp.text();
        const [code, msg] = signupText.split("::");

        if (code === "200") {
          setIsSignUp(false);
        } else {
          setError(msg || "Registration failed");
          return;
        }
      } else {
        const loginResp = await fetch("http://localhost:2020/back2/users/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const loginText = await loginResp.text();
        const parts = loginText.split("::");
        const code = parts[0];
        const token = parts[1];
        const roleFromServer = parts[2];
        const role = roleFromServer || "user";

        if (code === "200" && token) {
          localStorage.setItem("token", token);
          localStorage.setItem("authToken", token);
          localStorage.setItem("role", role);

          try {
            const usernameResp = await fetch(
              "http://localhost:2020/back2/users/getusername",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ csrid: token }),
              }
            );
            const username = await usernameResp.text();
            localStorage.setItem("username", username);
          } catch (_) {}

          if (role === "admin") {
            setShowAdminPopup(true);
            setTimeout(() => {
              setShowAdminPopup(false);
              navigate("/matches");
            }, 1500);
          } else {
            navigate("/matches");
          }
        } else {
          setError(token || "Invalid credentials");
        }
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* INLINE CSS */}
      <style>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #1f2933, #111827);
          padding: 20px;
          font-family: 'Segoe UI','Roboto',sans-serif;
        }

        .auth-form {
          width: 400px;
          max-width: 95vw;
          padding: 35px 32px 28px;
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
          color: white;
        }

        .auth-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 24px;
          text-transform: uppercase;
          color: #c4b5fd;
          letter-spacing: 0.12em;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          font-size: 0.85rem;
          opacity: 0.85;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 11px 13px;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.65);
          outline: none;
          background: rgba(15, 23, 42, 0.85);
          color: #e5e7eb;
          margin-top: 6px;
          font-size: 0.95rem;
          transition: box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s;
        }

        .form-group input::placeholder {
          color: rgba(148, 163, 184, 0.8);
        }

        /* make the select look consistent with inputs */
        .form-group select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          cursor: pointer;
        }

        /* dropdown list styling */
        .form-group select option {
          background-color: #020617;
          color: #e5e7eb;
        }

        .form-group select:focus,
        .form-group input:focus {
          box-shadow: 0 0 0 2px rgba(168, 139, 235, 0.8);
          border-color: #a855f7;
          background: rgba(15, 23, 42, 0.95);
        }

        .btn {
          width: 100%;
          margin-top: 18px;
          padding: 12px;
          border: none;
          border-radius: 999px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          color: #f9fafb;
          background: linear-gradient(90deg,#6f00ff,#9f55ff);
          box-shadow: 0 10px 25px rgba(55, 48, 163, 0.7);
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: default;
          box-shadow: none;
        }

        .toggle-link {
          color: #c4b5fd;
          cursor: pointer;
          font-weight: 600;
        }

        .toggle-link:hover {
          text-decoration: underline;
        }

        .error-text {
          color: #fb7185;
          text-align: center;
          margin-bottom: 10px;
          font-size: 0.9rem;
        }

        .admin-popup {
          position: fixed;
          top: 18%;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #2c3e50, #4a546e);
          padding: 18px 30px;
          border-radius: 15px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
          color: #fff;
          z-index: 1000;
          text-align: center;
          letter-spacing: 0.05em;
        }

        .admin-popup h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .auth-footer-text {
          margin-top: 18px;
          font-size: 0.9rem;
          text-align: center;
          color: rgba(209, 213, 219, 0.9);
        }
      `}</style>

      {/* ADMIN POPUP */}
      {showAdminPopup && (
        <motion.div
          className="admin-popup"
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Logged in as Admin</h3>
        </motion.div>
      )}

      <div className="auth-container">
        <motion.div
          className="auth-form"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="auth-title">{isSignUp ? "Sign Up" : "Login"}</h2>

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <motion.button
              type="submit"
              className="btn"
              whileHover={{ scale: loading ? 1 : 1.03 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              disabled={loading}
            >
              {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
            </motion.button>
          </form>

          <motion.p
            className="auth-footer-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <span onClick={toggleForm} className="toggle-link">
              {isSignUp ? "Login" : "Sign Up"}
            </span>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
