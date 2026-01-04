import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useTheme } from "../context/ThemeProvider";
import axios from "axios";
import Sidebar from "./Sidebar";
import Prompt from "./Prompt";
import toast from 'react-hot-toast';

function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [authUser, setAuthUser] = useAuth();
  const [prompt, setPrompt] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null); // starts as null
  const [loadingHistory, setLoadingHistory] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    console.log("useEffect: currentChatId =", currentChatId);
    if (currentChatId && typeof currentChatId === 'string' && currentChatId.trim() !== '') {
      handleSelectChat(currentChatId);
    }
  }, [currentChatId]);

  // Load chat history on component mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Token debug logs (keep for now)
  useEffect(() => {
    console.log("Current token:", localStorage.getItem("token"));
    console.log("Current user:", localStorage.getItem("user"));
    if (localStorage.getItem("token")) {
      try {
        const token = localStorage.getItem("token");
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("Token expires:", new Date(payload.exp * 1000));
      } catch (error) {
        console.error("Token parse failed:", error);
      }
    }
  }, []);

  // Store chat titles in localStorage
  const getChatTitle = (chatId) => {
    const titles = JSON.parse(localStorage.getItem('chatTitles') || '{}');
    return titles[chatId] || null;
  };

  const setChatTitle = (chatId, title) => {
    const titles = JSON.parse(localStorage.getItem('chatTitles') || '{}');
    titles[chatId] = title;
    localStorage.setItem('chatTitles', JSON.stringify(titles));
    setChatHistory(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title } : chat
    ));
  };

  // Fetch ALL chats
  const fetchAllChats = async () => {
    try {
      const token = localStorage.getItem("token");
      let allChats = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        const { data } = await axios.get(
          import.meta.env.VITE_API_URL + "/api/v1/chat/chats",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            params: { limit: 50, page, sort: 'createdAt:desc' }
          }
        );
        
        if (data.success && data.chats?.length) {
          allChats.push(...data.chats);
          hasMore = data.chats.length >= 50;
          page++;
        } else {
          hasMore = false;
        }
      }
      return allChats;
    } catch (error) {
      console.error("Error fetching chats:", error);
      return [];
    }
  };

  const fetchChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const allChats = await fetchAllChats();
      
      const chatsWithTitles = allChats.map(chat => {
        let title = getChatTitle(chat.id);
        if (!title) {
          title = chat.title || "New Chat";
        }
        return { ...chat, title };
      });
      
      setChatHistory(chatsWithTitles);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/user/logout`,
      { withCredentials: true }
    );
    
    // Clean up
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("chatTitles");
    setAuthUser(null);
    
    toast.success(data.message || "Logged out successfully", { duration: 2000 });
    setTimeout(() => navigate("/login", { replace: true }), 1000);
    
  } catch (error) {
    const msg = error.response?.data?.message || "Logout failed";
    toast.error(msg, { duration: 3000 });
  }
};

  const handleNewChat = () => {
    setPrompt([]);
    setCurrentChatId(null); 
  };

  // CRITICAL FIX: Validate chatId before use
  const handleSelectChat = async (chatId) => {
    // Validate input
    if (!chatId || typeof chatId !== 'string' || chatId.trim() === '') {
      console.warn("Invalid chatId:", chatId);
      return;
    }

    try {
      console.log("Loading chat:", chatId); // debug log
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/chats/${encodeURIComponent(chatId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      if (data.success) {
        const formattedMessages = data.chat.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        setPrompt(formattedMessages);
        setCurrentChatId(chatId); 
        setIsOpen(false);
      }
    } catch (error) {
      console.error(`Failed to load chat ${chatId}:`, error);
      if (error.response?.status === 404) {
        alert("Chat not found. It may have been deleted.");
        setPrompt([]);
        setCurrentChatId(null);
      }
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!chatId) return; 
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/chats/${encodeURIComponent(chatId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      // Cleanup
      const titles = JSON.parse(localStorage.getItem('chatTitles') || '{}');
      delete titles[chatId];
      localStorage.setItem('chatTitles', JSON.stringify(titles));
      
      if (chatId === currentChatId) {
        setPrompt([]);
        setCurrentChatId(null);
      }
      
      await fetchChatHistory();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEditChatTitle = async (chatId, newTitle) => {
    if (!chatId || !newTitle?.trim()) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/v1/chat/chats/${encodeURIComponent(chatId)}/title`,
        { title: newTitle.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setChatTitle(chatId, newTitle.trim());
    } catch (error) {
      console.error("Title update failed:", error);
    }
  };

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[#1B1717] text-[#EEEBDD]'
        : 'bg-[#FCF8F8] text-gray-900'
    }`}>
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        user={user}
        handleLogout={handleLogout}
        onNewChat={handleNewChat}
        messageCount={prompt.length / 2}
        chatHistory={chatHistory}
        loadingHistory={loadingHistory}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
        onDeleteChat={handleDeleteChat}
        onEditChatTitle={handleEditChatTitle}
      />

      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? 'lg:ml-64' : 'ml-0'
        }`}
      >
        <Prompt 
          prompt={prompt} 
          setPrompt={setPrompt}
          currentChatId={currentChatId}
          setCurrentChatId={setCurrentChatId}
          setChatTitle={setChatTitle}
          fetchChatHistory={fetchChatHistory}
        />
      </div>
    </div>
  );
}

export default Home;