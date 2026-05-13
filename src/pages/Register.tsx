import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // ✅ use your Supabase client

// 👇 ADD YOUR REGISTER IMAGE HERE (same style as login)
import myImage from "../assets/register-bg.png";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      // ✅ Register user with Supabase Auth
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { full_name: name }, // save name to user metadata
          emailRedirectTo: window.location.origin + "/login",
        },
      });

      if (error) throw error;

      alert("✅ Registered Successfully! Please check your email to confirm.");
      navigate("/");

    } catch (err: any) { // ✅ fixed 'unknown' type error
      alert(err.message || "Registration Failed");

    } finally {
      setLoading(false);
    }
  };

  // ✅ Google Sign Up
  const handleGoogleRegister = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="register-page">

      {/* LEFT SIDE */}
      <div
        className="register-left"
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

            <div className="left-buttons">

            </div>

          </div>

          <div className="bottom-user">

            <div className="avatar">
              🤖
            </div>

            <div>

              <h3>AI Productivity</h3>
              <p>Next Generation Learning</p>

            </div>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">

        <div className="register-card">

          <h1>Create Account</h1>

          <p>Start your AI-powered learning experience</p>

          <div className="input-group">

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

          </div>

          <div className="forgot-password">
            Password must be at least 6 characters
          </div>

          <div className="divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          <button 
            className="google-btn"
            onClick={handleGoogleRegister}
            disabled={loading}
          >
            Continue with Google
          </button>

          <button
            className="register-btn"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="login-link">
            Already have an account?
            <Link to="/">Login</Link>
          </div>

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