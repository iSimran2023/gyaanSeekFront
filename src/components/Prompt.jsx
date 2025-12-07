import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, Bot, Globe, Paperclip } from "lucide-react";
import axios from "axios";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";

function Prompt() {
  const [inputValue, setInputValue] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [prompt, setPrompt] = useState([]);
  const [loading, setLoading] = useState(false);
  const promptEndRef = useRef();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const storedPrompt = localStorage.getItem(`promptHistory_${user._id}`);
    if (storedPrompt) {
      setPrompt(JSON.parse(storedPrompt));
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    localStorage.setItem(`promptHistory_${user._id}`, JSON.stringify(prompt));
  }, [prompt]);

  useEffect(() => {
    promptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [prompt, loading]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setTypeMessage(trimmed);
    setInputValue("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:4002/api/v1/aiTool/prompt",
        { content: trimmed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setPrompt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setPrompt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: "Something went wrong with AI response" },
      ]);
    } finally {
      setLoading(false);
      setTypeMessage(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Greeting or Chat */}
      <div className="flex-1 overflow-hidden">
        {prompt.length === 0 ? (
          // Greeting Section
          <div className="h-full flex items-center justify-center">
            <div className="text-center w-full max-w-4xl px-4">
              {" "}
              {/* Full width with max constraint */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">GS</span>
                </div>
                <h1 className="text-3xl font-semibold text-white">
                  Hi, I'm GyaanSeek
                </h1>
              </div>
              <p className="text-gray-400 text-lg">How can I help you?</p>
            </div>
          </div>
        ) : (
          // Chat Section 
          <div className="h-full overflow-y-auto py-6 ml-2">
            <div className="w-full max-w-4xl mx-auto px-4">
              {" "}
              {prompt.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="max-w-[100%] bg-[#232323] text-white rounded-xl px-4 py-3 mt-4 text-sm whitespace-pre-wrap">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
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
                                className="bg-gray-800 px-1 py-0.5 rounded"
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
                    <div className="max-w-[70%] bg-blue-700 text-white rounded-xl px-4 py-3 text-sm whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}
              {loading && typeMessage && (
                <div className="flex justify-end">
                  <div className="max-w-[70%] bg-blue-700 text-white rounded-xl px-4 py-3 text-sm whitespace-pre-wrap">
                    {typeMessage}
                  </div>
                </div>
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#232323] text-white px-4 py-3 rounded-xl text-sm animate-pulse">
                    Loading...
                  </div>
                </div>
              )}
              <div ref={promptEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input Section - Same width as chat */}
      <div className="bg-[#1e1e1e] py-6">
        <div className="w-full max-w-4xl mx-auto px-4">
          {" "}
          <div className="bg-[#2f2f2f] rounded-2xl px-6 py-6 shadow-lg">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message GyaanSeek"
              className="bg-transparent w-full text-white placeholder-gray-400 text-lg outline-none"
            />
            <div className="flex items-center justify-between mt-4 gap-4">
              <div className="flex">
                <button className="flex items-center gap-2 border border-gray-500 text-white text-base px-3 py-1.5 rounded-full hover:bg-gray-600 transition">
                  <Globe className="w-5 h-4" />
                  Search
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-white transition">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSend}
                  className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full text-white transition"
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
