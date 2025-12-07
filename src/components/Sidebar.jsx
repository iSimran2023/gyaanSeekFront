import React from "react";
import { LogOut, X } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4002/api/v1/user/logout",
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      alert(data.message);

      setAuthUser(null);
      navigate("/login");
    } catch (error) {
      alert(error?.response?.data?.errors || "Logout Failed");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex p-4 justify-between items-center">
          <div className="text-2xl font-bold text-gray-200">GyaanSeek</div>
        </div>

        {/* History */}
        <div className="p-4">
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl transition-colors">
            + New Chat
          </button>
          <div className="text-gray-500 text-sm text-center mt-5">
            No chat history yet
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <img
        src="https://i.pravatar.cc/32"
        alt="profile"
        className="rounded-full w-8 h-8"
      />
      <span className="text-gray-300 font-medium">
        {user ? user?.firstName : "My Profile"}
      </span>
    </div>
    
    {user && (
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-gray-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </button>
    )}
  </div>
</div>
    </div>
  );
}

export default Sidebar;