import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // ✅ fixed path

// 👇 IMPORT YOUR IMAGE HERE
import myImage from "../assets/login-bg.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 EMAIL/PASSWORD LOGIN
  const handleLogin = async () => {
    setLoading(true);
    try {
      // ✅ removed unused `data`
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      // ✅ SUCCESS
      navigate("/dashboard");

    } catch (err: any) { // ✅ fixed type error
      alert(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
    } catch (err: any) { // ✅ fixed type error
      alert(err.message);
    }
  };

  // 🔁 FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!email) return alert("Please enter your email first");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      alert("✅ Check your email for reset link");
    } catch (err: any) { // ✅ fixed type error
      alert(err.message);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE */}
      <div
        className="login-left"
        style={{
          backgroundImage: `url(${myImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="overlay"></div>
        <div className="left-content">
          <div className="top-left">
            <h2>StudyPlanner AI</h2>
          </div>
          <div className="bottom-user">
            <div className="avatar">👩‍🎓</div>
            <div>
              <h3>Smart Student</h3>
              <p>AI Productivity System</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-card">
          <h1>LOGIN</h1>
          <p>Login to continue your AI study journey</p>

          {/* INPUTS */}
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {/* FORGOT PASSWORD */}
          <div 
            className="forgot-password"
            onClick={handleForgotPassword}
            style={{cursor:"pointer"}}
          >
            Forgot password?
          </div>

          {/* DIVIDER */}
          <div className="divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          {/* GOOGLE LOGIN */}
          <button 
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Login with Google
          </button>

          {/* LOGIN BUTTON */}
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Processing..." : "Login"}
          </button>

          {/* REGISTER LINK */}
          <div className="register-link">
            Don’t have an account?
            <Link to="/register">Sign up</Link>
          </div>

          {/* SOCIALS */}
          <div className="socials">
            <span>🌐</span>
            <span>📘</span>
            <span>📸</span>
            <span>💼</span>
          </div>
        </div>
      </div>
    </div>
  );
}