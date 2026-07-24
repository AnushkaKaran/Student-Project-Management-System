import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, UserCircle, ChevronDown, AlertCircle, ArrowRight, Layers
} from "lucide-react";
import api from "../api/axios";
import { getStudentDisplayName } from "../utils/nameHelper";
import "./LoginPage.css";

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      
      const payloadRole = role === 'faculty' ? 'Faculty' : (role === 'admin' ? 'Admin' : 'Student');
      
      const response = await api.post("/auth/login", {
        Role: payloadRole,
        Email: email,
        Password: password
      });

      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem("token", token);
      
      // Pass authenticated user context upward
      onLogin({ 
        role: user.Role.toLowerCase(), 
        name: user.UserName || getStudentDisplayName(user) || "User", 
        email: user.Email,
        id: user.UserID 
      });

    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please check your email, password, and selected role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="spms-login">
      
      {/* Left Branding Panel */}
      <div className="spms-login__brand-panel">
        <div className="spms-login__brand-pattern"></div>
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6 }}
          className="spms-login__brand-content"
        >
          <div className="spms-login__logo">
            <div className="spms-login__logo-icon">
              <Layers size={32} strokeWidth={2.5} />
            </div>
            ProjexHub
          </div>
          <h1 className="spms-login__tagline">
            The modern operating system for academic projects.
          </h1>
          <p className="spms-login__description">
            Streamline project proposals, automate evaluations, and simplify collaboration between students and faculty guides in one unified platform.
          </p>
        </motion.div>
      </div>

      {/* Right Form Panel */}
      <div className="spms-login__form-panel">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.2 }}
          className="spms-login__form-container"
        >
          <div className="spms-login__header">
            <h2 className="spms-login__title">Welcome Back</h2>
            <p className="spms-login__subtitle">Enter your credentials to access your account.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="spms-login__error"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="spms-login__form" onSubmit={handleSubmit}>
            
            <div className="spms-login__field">
              <label className="spms-login__label">Account Role</label>
              <div className="spms-login__input-wrapper">
                <UserCircle size={18} className="spms-login__input-icon" />
                <select 
                  className="spms-login__select"
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="student">Student Portal</option>
                  <option value="faculty">Faculty Portal</option>
                  <option value="admin">Administrator</option>
                </select>
                <ChevronDown size={16} className="spms-login__select-arrow" />
              </div>
            </div>

            <div className="spms-login__field">
              <label className="spms-login__label">Email Address</label>
              <div className="spms-login__input-wrapper">
                <Mail size={18} className="spms-login__input-icon" />
                <input
                  type="email"
                  className="spms-login__input"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="spms-login__field">
              <label className="spms-login__label">Password</label>
              <div className="spms-login__input-wrapper">
                <Lock size={18} className="spms-login__input-icon" />
                <input
                  type="password"
                  className="spms-login__input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="spms-login__btn" disabled={loading}>
              {loading ? (
                <div className="spms-login__spinner"></div>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
            
          </form>
        </motion.div>
      </div>

    </div>
  );
}