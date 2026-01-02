import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, Globe, Sun, Moon } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "../context/ThemeProvider";
import { useNavigate } from "react-router-dom";

function Prompt({ 
  prompt, 
  setPrompt, 
  currentChatId, 
  setCurrentChatId,
  setChatTitle,
  fetchChatHistory 
}) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const promptEndRef = useRef();
  const navigate = useNavigate();

  // Scroll to bottom on new messages
  useEffect(() => {
    promptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [prompt, loading]);

  // ✅ FIXED: Handle token and auth errors
  const getValidToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found in localStorage");
      return null;
    }
    // Optional: validate JWT format (basic check)
    if (!token.match(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/)) {
      console.warn("Token format invalid:", token);
      return null;
    }
    return token;
  };

  const handleSend = async () => {
  const trimmed = inputValue.trim();
  if (!trimmed) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Session expired. Please log in again.");
    navigate("/login");
    return;
  }

  setInputValue("");
  setLoading(true);

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_FRONTEND_URL}/api/v1/aiTool/prompt`,
      { 
        content: trimmed,
        chatId: currentChatId // can be null/undefined/string
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    // ✅ 1. Create new messages
    const newUserMsg = { role: "user", content: trimmed };
    const newAIMsg = { role: "assistant", content: data.reply };
    const newPrompt = [...prompt, newUserMsg, newAIMsg];
    setPrompt(newPrompt);

    // ✅ 2. CRITICAL: Update currentChatId if new ID received
    if (data.chatId && (!currentChatId || currentChatId !== data.chatId)) {
      const newChatId = data.chatId;
      setCurrentChatId(newChatId); // ← This was missing or broken
      
      // Set title for new chats only
      if (!currentChatId) {
        const title = trimmed.length > 40 
          ? trimmed.substring(0, 40) + "..." 
          : trimmed;
        setChatTitle(newChatId, title);
      }
    }

    // ✅ 3. Refresh chat list (so new chat appears)
    setTimeout(fetchChatHistory, 200);

  } catch (error) {
    console.error("Prompt error:", error);
    if (error.response?.status === 401) {
      alert("Session expired. Redirecting to login...");
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      const errorMsg = error.response?.data?.error || "AI response failed. Please try again.";
      setPrompt(prev => [...prev, { role: "user", content: inputValue }, { role: "assistant", content: errorMsg }]);
    }
  } finally {
    setLoading(false);
  }
  
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar with Theme Toggle */}
      <div className={`flex justify-end px-6 py-3 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#1B1717]' : 'bg-[#FCF8F8]'
      }`}>
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'bg-[#810000] hover:bg-[#630000] text-[#EEEBDD]'
              : 'bg-[#FBEFEF] hover:bg-[#F9DFDF] text-gray-700'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Greeting or Chat */}
      <div className="flex-1 overflow-hidden">
        {prompt.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center w-full max-w-4xl px-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-[#810000] to-[#630000]'
                    : 'bg-gradient-to-r from-[#F5AFAF] to-[#F9DFDF]'
                }`}>
                  <span className="text-white font-bold text-xl">GS</span>
                </div>
                <h1 className={`text-3xl font-semibold ${
                  theme === 'dark' ? 'text-[#EEEBDD]' : 'text-gray-900'
                }`}>
                  Hi, I'm GyaanSeek
                </h1>
              </div>
              <p className={`text-lg ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                How can I help you?
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto ml-2">
            <div className="w-full max-w-4xl mx-auto px-4">
              {prompt.map((msg, index) => (
                <div
                  key={index}
                  className={`flex mt-4 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className={`max-w-[100%] rounded-xl px-4 py-3 mt-2 text-sm whitespace-pre-wrap transition-colors duration-300 ${
                      theme === 'dark' 
                        ? 'bg-[#2D2D2D] text-[#EEEBDD] border border-[#630000]'
                        : 'bg-[#FBEFEF] text-gray-900 border border-[#F9DFDF]'
                    }`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={codeTheme}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-lg mt-2"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code
                                className={`px-1 py-0.5 rounded ${
                                  theme === 'dark' 
                                    ? 'bg-[#1B1717] text-[#EEEBDD]' 
                                    : 'bg-[#F9DFDF] text-gray-800'
                                }`}
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className={`max-w-[70%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap transition-colors duration-300 ${
                      theme === 'dark' 
                        ? 'bg-[#810000] text-[#EEEBDD]'
                        : 'bg-[#F5AFAF] text-white'
                    }`}>
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start mt-4">
                  <div className={`px-4 py-3 rounded-xl text-sm animate-pulse transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'bg-[#2D2D2D] text-[#EEEBDD] border border-[#630000]' 
                      : 'bg-[#FBEFEF] text-gray-900 border border-[#F9DFDF]'
                  }`}>
                    Thinking...
                  </div>
                </div>
              )}
              
              <div ref={promptEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className={`py-6 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#1B1717]' : 'bg-[#FCF8F8]'
      }`}>
        <div className="w-full max-w-4xl mx-auto px-4">
          <div className={`rounded-2xl px-6 py-6 shadow-lg transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-[#2D2D2D] border border-[#630000]'
              : 'bg-white border border-[#F9DFDF]'
          }`}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message GyaanSeek"
              className={`bg-transparent w-full placeholder-gray-400 text-lg outline-none resize-none transition-colors duration-300 ${
                theme === 'dark' ? 'text-[#EEEBDD]' : 'text-gray-900'
              }`}
              rows="1"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
            <div className="flex items-center justify-between mt-4 gap-4">
              <div className="flex">
                <button 
                  className={`flex items-center gap-2 border text-base px-3 py-1.5 rounded-full transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'border-[#630000] text-[#EEEBDD] hover:bg-[#630000]' 
                      : 'border-[#F9DFDF] text-gray-700 hover:bg-[#FBEFEF]'
                  }`}
                >
                  <Globe className="w-5 h-4" />
                  Search
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || loading}
                  className={`transition-colors duration-300 p-2 rounded-full ${
                    inputValue.trim() && !loading
                      ? theme === 'dark'
                        ? "bg-[#810000] hover:bg-[#630000] text-white"
                        : "bg-[#F5AFAF] hover:bg-[#F9DFDF] text-white"
                      : theme === 'dark'
                        ? "bg-[#2D2D2D] text-gray-500 border border-[#630000] cursor-not-allowed"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Prompt;