import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_FRONTEND_URL}/api/v1/user/signup`,
        formData,
        { withCredentials: true }
      );
      alert(data.message || "Signup succeeded");
      navigate("/login");
    } catch (error) {
      const msg = error?.response?.data?.errors || "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-[#1e1e1e] w-full max-w-md max-h-[480px] rounded-2xl p-6 shadow-lg">
        <h1 className="text-[#EEEBDD] text-center">Signup</h1>

        <div className="mb-4 mt-2">
          <input
            className="w-full border border-[#630000] rounded-md px-4 py-3 placeholder:text-gray-400 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#EEEBDD]"
            type="text"
            name="firstName"
            placeholder="firstname"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4 mt-2">
          <input
            className="w-full border border-[#630000] rounded-md px-4 py-3 placeholder:text-gray-400 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#EEEBDD]"
            type="text"
            name="lastName"
            placeholder="lastname"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4 mt-2">
          <input
            className="w-full border border-[#630000] rounded-md px-4 py-3 placeholder:text-gray-400 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#EEEBDD]"
            type="text"
            name="email"
            placeholder="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4 mt-2 relative">
          <input
            className="w-full border border-[#630000] rounded-md px-4 py-3 placeholder:text-gray-400 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#EEEBDD]"
            type={showPassword ? "text" : "password"} 
            name="password"
            placeholder="password"
            value={formData.password}
            onChange={handleChange}
          />
          <span
            className="absolute right-3 top-3 text-black cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)} 
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {error && <span className="text-red-600 text-sm mb-4 block">{error}</span>}

        <p className="text-xs text-[#EEEBDD] mt-4 mb-6">
          By signing up or logging in, you consent to Gyaanseek's
          <a className="underline ml-1" href="">Terms of use</a> and{" "}
          <a className="underline" href="">Privacy Policy</a>.
        </p>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-[#810000] hover:bg-[#630000] text-[#EEEBDD] font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Signing..." : "Signup"}
        </button>

        <div className="flex justify-between mt-4 text-sm">
          <span className="text-[#EEEBDD]">Already registered?</span>
          <Link className="text-[#EEEBDD] hover:text-[#810000]" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
