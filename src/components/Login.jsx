import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import toast from 'react-hot-toast'; 

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const navigate = useNavigate();
  const [, setAuthUser] = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async () => {
    // Immediate client-side validation
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error("Please enter email and password", { duration: 2000 });
      return;
    }

    setLoading(true);
    setError("");

    // Show loading toast instantly
    const toastId = toast.loading("Logging in...", {
      style: { background: '#1e1e1e', color: '#EEEBDD', border: '1px solid #810000' }
    });

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/user/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      // Replace loading toast with success
      toast.success(data.message || "Login successful!", {
        id: toastId,
        duration: 2000
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setAuthUser(data.token);
      navigate("/");

    } catch (error) {
      // Smart error message
      let msg = "Login failed";
      if (error.response?.status === 401 || error.response?.status === 403) {
        msg = "Invalid email or password";
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message === 'Network Error') {
        msg = "No internet connection";
      }

      // Replace loading toast with error
      toast.error(msg, { id: toastId, duration: 3000 });
      setError(msg); 

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-[#1e1e1e] w-full max-w-md max-h-[360px] rounded-2xl p-6 shadow-lg">
        <h1 className="text-[#EEEBDD] text-center text-xl font-bold">Login</h1>

        <div className="mb-4 mt-2">
          <input
            className="w-full border border-[#630000] rounded-md px-4 py-3 placeholder:text-gray-500 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#EEEBDD] bg-white"
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="mb-4 mt-2 relative">
          <input
            className="w-full border border-[#630000] rounded-md px-4 py-3 placeholder:text-gray-500 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#EEEBDD] bg-white"
            type={showPassword ? "text" : "password"} 
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          <span
            className="absolute right-3 top-3 text-gray-600 cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)} 
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {error && !loading && (
          <span className="text-red-500 text-sm mb-3 block">{error}</span>
        )}

        <p className="text-xs text-[#EEEBDD] mt-2 mb-4">
          By logging in, you agree to GyaanSeek’s{" "}
          <a className="underline ml-0.5" href="#">Terms</a> and{" "}
          <a className="underline" href="#">Privacy Policy</a>.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#810000] hover:bg-[#630000] text-[#EEEBDD] font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex justify-between mt-4 text-sm">
          <span className="text-[#EEEBDD]">No account?</span>
          <Link className="text-[#EEEBDD] hover:text-[#810000] font-medium" to="/signup">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;