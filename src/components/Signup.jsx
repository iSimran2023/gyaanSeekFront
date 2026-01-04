import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from 'react-hot-toast'; 

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async () => {
    // Immediate validation
    const { firstName, lastName, email, password } = formData;
    
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      toast.error("All fields are required", { duration: 2000 });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email", { duration: 2000 });
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters", { duration: 2500 });
      return;
    }

    setLoading(true);
    setError("");

    //Show loading toast instantly
    const toastId = toast.loading("Creating account...", {
      style: { 
        background: '#1e1e1e', 
        color: '#EEEBDD', 
        border: '1px solid #810000' 
      }
    });

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/user/signup`,
        formData,
        { withCredentials: true }
      );

      //Success!
      toast.success(data.message || "Account created!", {
        id: toastId,
        duration: 2000
      });

      setTimeout(() => navigate("/login"), 1500);

    } catch (error) {
      let msg = "Signup failed. Please try again.";
      
      if (error.response?.status === 400) {
        msg = error.response.data?.message || "Invalid input";
      } else if (error.response?.status === 409 || error.response?.data?.message?.includes('exists')) {
        msg = "User already exists";
      } else if (error.message === 'Network Error') {
        msg = "No internet connection";
      }

      toast.error(msg, { id: toastId, duration: 3000 });
      setError(msg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-[#1e1e1e] w-full max-w-md rounded-2xl p-6 shadow-lg">
        <h1 className="text-[#EEEBDD] text-center text-xl font-bold">Sign Up</h1>

        <div className="mb-3 mt-4">
          <input
            className="w-full border border-[#630000] rounded-md px-4 py-3 placeholder:text-gray-500 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#EEEBDD] bg-white"
            type="text"
            name="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <input
            className="w-full border border-[#630000] rounded-md px-4 py-3 placeholder:text-gray-500 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#EEEBDD] bg-white"
            type="text"
            name="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="mb-3">
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

        <div className="mb-4 relative">
          <input
            className="w-full border border-[#630000] rounded-md px-4 py-3 placeholder:text-gray-500 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#EEEBDD] bg-white"
            type={showPassword ? "text" : "password"} 
            name="password"
            placeholder="Password (min. 6 chars)"
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
          By signing up, you agree to GyaanSeek’s{" "}
          <a className="underline ml-0.5" href="#">Terms</a> and{" "}
          <a className="underline" href="#">Privacy Policy</a>.
        </p>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-[#810000] hover:bg-[#630000] text-[#EEEBDD] font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <div className="flex justify-between mt-4 text-sm">
          <span className="text-[#EEEBDD]">Already have an account?</span>
          <Link className="text-[#EEEBDD] hover:text-[#810000] font-medium" to="/login">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;