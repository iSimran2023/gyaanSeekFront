import React, { useState } from "react";
import { LogOut, PanelLeft, X, Pencil, Trash2, Check } from "lucide-react";
import { useTheme } from "../context/ThemeProvider";

function Sidebar({ isOpen, setIsOpen, user, handleLogout, onNewChat, messageCount, chatHistory, onSelectChat, currentChatId, onDeleteChat, onEditChatTitle }) {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const { theme } = useTheme();

  const truncateTitle = (title, wordCount = 3) => {
    if (!title || typeof title !== 'string') return 'New Chat';
    const words = title.trim().split(/\s+/);
    if (words.length <= wordCount) return title;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  // Extract first message from chat history to use as title
  const getChatDisplayTitle = (chat) => {
    if (chat.title && chat.title !== 'Chat') {
      return chat.title;
    }
    
    // If chat has messages, use the first user message as title
    if (chat.messages && chat.messages.length > 0) {
      const firstUserMessage = chat.messages.find(msg => msg.role === 'user');
      if (firstUserMessage && firstUserMessage.content) {
        const words = firstUserMessage.content.trim().split(/\s+/);
        return words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
      }
    }
    
    return 'New Chat';
  };

  const handleEditClick = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title || getChatDisplayTitle(chat));
  };

  const handleSaveEdit = (chatId, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onEditChatTitle(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleDeleteClick = (chatId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this chat?")) {
      onDeleteChat(chatId);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Menu Button */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 left-4 z-50 p-2 text-white rounded-lg transition-colors ${
            theme === 'dark'
              ? 'bg-[#810000] hover:bg-[#EEEBDD] hover:text-[#1B1717]' 
              : 'bg-[#F5AFAF] hover:bg-[#F9DFDF]' 
          }`}
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-[#1B1717] text-[#EEEBDD] border-r border-[#630000]' 
            : 'bg-[#FCF8F8] text-gray-900 border-r border-[#F9DFDF]'
        } z-40 transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-64`}
      >
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex p-4 justify-between items-center">
            <div className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-[#EEEBDD]' : 'text-gray-800'
            }`}>
              GyaanSeek
            </div>
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-[#630000] text-[#EEEBDD]'
                  : 'hover:bg-[#F9DFDF]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button 
              onClick={() => {
                if (messageCount > 0) {
                  onNewChat();
                }
              }}
              className={`w-full text-white px-4 py-3 rounded-xl transition-colors ${
                messageCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                theme === 'dark'
                  ? messageCount > 0 
                    ? 'bg-[#810000] hover:bg-[#630000]' 
                    : 'bg-gray-700'
                  : messageCount > 0
                    ? 'bg-[#F5AFAF] hover:bg-[#F9DFDF]'
                    : 'bg-gray-500'
              }`}
              disabled={messageCount === 0}
            >
              + New Chat
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto px-4">
            {!chatHistory || chatHistory.length === 0 ? (
              <div className={`text-sm text-center mt-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No chat history yet
              </div>
            ) : (
              <div className="space-y-2">
                {chatHistory.map((chat) => {
                  const displayTitle = getChatDisplayTitle(chat);
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => onSelectChat(chat.id)}
                      className={`group relative w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        currentChatId === chat.id
                          ? theme === 'dark'
                            ? 'bg-[#810000] text-[#EEEBDD]'
                            : 'bg-[#F5AFAF] text-white'
                          : theme === 'dark' 
                            ? 'bg-[#2D2D2D] hover:bg-[#630000] text-[#EEEBDD]'
                            : 'bg-[#FBEFEF] hover:bg-[#F9DFDF] text-gray-700'
                      }`}
                    >
                      {editingChatId === chat.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(chat.id, e);
                              if (e.key === 'Escape') setEditingChatId(null);
                            }}
                            className={`flex-1 text-sm px-2 py-1 rounded outline-none ${
                              theme === 'dark' 
                                ? 'bg-[#EEEBDD] text-[#1B1717]' 
                                : 'bg-white text-gray-900'
                            }`}
                            autoFocus
                          />
                          <button
                            onClick={(e) => handleSaveEdit(chat.id, e)}
                            className={`p-1 rounded ${
                              theme === 'dark' 
                                ? 'hover:bg-[#630000] text-[#EEEBDD]' 
                                : 'hover:bg-[#F9DFDF]'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div 
                                className="text-sm font-medium truncate"
                                title={displayTitle}
                              >
                                {truncateTitle(displayTitle)}
                              </div>
                              {/* Removed message count display */}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <button
                                onClick={(e) => handleEditClick(chat, e)}
                                className={`p-1 rounded ${
                                  theme === 'dark' 
                                    ? 'hover:bg-[#630000] text-[#EEEBDD]' 
                                    : 'hover:bg-[#F9DFDF]'
                                }`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteClick(chat.id, e)}
                                className={`p-1 rounded ${
                                  theme === 'dark'
                                    ? 'hover:bg-[#810000] text-[#EEEBDD]'
                                    : 'hover:bg-red-500 text-white'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto p-4 space-y-3">
          {/* User Profile */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://i.pravatar.cc/32"
                alt="profile"
                className="rounded-full w-8 h-8"
              />
              <span className={`font-medium ${
                theme === 'dark' ? 'text-[#EEEBDD]' : 'text-gray-700'
              }`}>
                {user ? user?.firstName : "My Profile"}
              </span>
            </div>

            {user && (
              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'text-[#EEEBDD] hover:text-white hover:bg-[#630000]' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-[#FBEFEF]'
                }`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;