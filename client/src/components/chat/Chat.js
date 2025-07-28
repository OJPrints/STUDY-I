import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPaperPlane, 
  FaSmile, 
  FaPaperclip, 
  FaMicrophone, 
  FaSearch, 
  FaEllipsisV,
  FaUser,
  FaCircle,
  FaFile,
  FaImage,
  FaVideo,
  FaMusic,
  FaFileUpload,
  FaTimes,
  FaCheck,
  FaClock
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockChats = [
      {
        id: 1,
        title: "Computer Science Department",
        type: "department",
        department: "computer-science",
        lastMessage: "Great discussion on React hooks!",
        lastMessageTime: "2 minutes ago",
        unreadCount: 3,
        participants: 45,
        isActive: true
      },
      {
        id: 2,
        title: "Web Development Team",
        type: "group",
        lastMessage: "Meeting scheduled for tomorrow",
        lastMessageTime: "1 hour ago",
        unreadCount: 0,
        participants: 12,
        isActive: true
      },
      {
        id: 3,
        title: "Data Science Discussion",
        type: "department",
        department: "computer-science",
        lastMessage: "New ML algorithm implementation",
        lastMessageTime: "3 hours ago",
        unreadCount: 1,
        participants: 28,
        isActive: true
      }
    ];

    if (mockChats.length > 0) {
      setSelectedChat(mockChats[0]);
    }
  }, []);

  // Mock messages - in real app, this would come from API
  useEffect(() => {
    if (selectedChat) {
      const mockMessages = [
        {
          id: 1,
          sender: {
            id: 1,
            firstName: "Sarah",
            lastName: "Johnson",
            avatar: "https://via.placeholder.com/40",
            role: "instructor"
          },
          content: "Welcome everyone to our Computer Science department chat! Feel free to ask questions and share insights.",
          timestamp: "2024-01-15T10:00:00Z",
          type: "text",
          reactions: [
            { user: 2, emoji: "👍" },
            { user: 3, emoji: "❤️" }
          ],
          replies: []
        },
        {
          id: 2,
          sender: {
            id: 2,
            firstName: "Alex",
            lastName: "Thompson",
            avatar: "https://via.placeholder.com/40",
            role: "student"
          },
          content: "Thanks Sarah! I have a question about the React hooks assignment. Can anyone help?",
          timestamp: "2024-01-15T10:05:00Z",
          type: "text",
          reactions: [],
          replies: [
            {
              id: 1,
              sender: {
                id: 3,
                firstName: "Maria",
                lastName: "Garcia",
                avatar: "https://via.placeholder.com/40"
              },
              content: "I can help! What specific part are you stuck on?",
              timestamp: "2024-01-15T10:07:00Z"
            }
          ]
        },
        {
          id: 3,
          sender: {
            id: 4,
            firstName: "David",
            lastName: "Kim",
            avatar: "https://via.placeholder.com/40",
            role: "student"
          },
          content: "I found this great resource on React hooks: https://react.dev/reference/react",
          timestamp: "2024-01-15T10:10:00Z",
          type: "link",
          reactions: [
            { user: 1, emoji: "👍" },
            { user: 2, emoji: "👍" }
          ],
          replies: []
        }
      ];

      setMessages(mockMessages);
    }
  }, [selectedChat]);

  // Mock online users
  useEffect(() => {
    const mockOnlineUsers = [
      { id: 1, firstName: "Sarah", lastName: "Johnson", avatar: "https://via.placeholder.com/32", isOnline: true },
      { id: 2, firstName: "Alex", lastName: "Thompson", avatar: "https://via.placeholder.com/32", isOnline: true },
      { id: 3, firstName: "Maria", lastName: "Garcia", avatar: "https://via.placeholder.com/32", isOnline: true },
      { id: 4, firstName: "David", lastName: "Kim", avatar: "https://via.placeholder.com/32", isOnline: false }
    ];
    setOnlineUsers(mockOnlineUsers);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar || "https://via.placeholder.com/40",
        role: user.role
      },
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: "text",
      reactions: [],
      replies: []
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In real app, upload file to server and get URL
      const message = {
        id: Date.now(),
        sender: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar || "https://via.placeholder.com/40",
          role: user.role
        },
        content: file.name,
        timestamp: new Date().toISOString(),
        type: "file",
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        reactions: [],
        replies: []
      };

      setMessages(prev => [...prev, message]);
    }
  };

  const addReaction = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.user === user.id);
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions.map(r => 
              r.user === user.id ? { ...r, emoji } : r
            )
          };
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { user: user.id, emoji }]
          };
        }
      }
      return msg;
    }));
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="chat-container">
      {/* Chat Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Discussions</h2>
          <div className="sidebar-actions">
            <button className="btn-icon" onClick={() => setShowFileUpload(true)}>
              <FaSearch />
            </button>
          </div>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="chats-list">
          {filteredChats.map((chat) => (
            <motion.div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
              onClick={() => setSelectedChat(chat)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="chat-item-avatar">
                <div className="avatar">
                  {chat.type === 'department' ? '🏢' : '👥'}
                </div>
                {chat.isActive && <div className="online-indicator" />}
              </div>
              
              <div className="chat-item-content">
                <div className="chat-item-header">
                  <h3>{chat.title}</h3>
                  <span className="chat-time">{chat.lastMessageTime}</span>
                </div>
                <p className="chat-last-message">{chat.lastMessage}</p>
                <div className="chat-item-footer">
                  <span className="participants-count">
                    <FaUser /> {chat.participants}
                  </span>
                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </aside>

      {/* Chat Main Area */}
      <main className="chat-main">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <header className="chat-header">
              <div className="chat-header-info">
                <h2>{selectedChat.title}</h2>
                <div className="chat-header-meta">
                  <span className="participants">
                    <FaUser /> {selectedChat.participants} participants
                  </span>
                </div>
              </div>
              
              <div className="chat-header-actions">
                <button className="btn-icon">
                  <FaSearch />
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="messages-container">
              <div className="messages-list">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`message ${message.sender.id === user.id ? 'own' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="message-avatar">
                      <img src={message.sender.avatar} alt={`${message.sender.firstName} ${message.sender.lastName}`} />
                      {onlineUsers.find(u => u.id === message.sender.id)?.isOnline && (
                        <div className="online-indicator" />
                      )}
                    </div>
                    
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">
                          {message.sender.firstName} {message.sender.lastName}
                        </span>
                        <span className="message-time">{formatTime(message.timestamp)}</span>
                      </div>
                      
                      <div className="message-body">
                        {message.type === 'file' ? (
                          <div className="file-message">
                            <div className="file-info">
                              <span className="file-name">{message.fileName}</span>
                              <span className="file-size">{(message.fileSize / 1024).toFixed(1)} KB</span>
                            </div>
                            <button className="btn btn-outline btn-sm">Download</button>
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>

                      {/* Reactions */}
                      {message.reactions.length > 0 && (
                        <div className="message-reactions">
                          {message.reactions.map((reaction, index) => (
                            <span key={index} className="reaction">
                              {reaction.emoji} {message.reactions.filter(r => r.emoji === reaction.emoji).length}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Replies */}
                      {message.replies.length > 0 && (
                        <div className="message-replies">
                          {message.replies.map((reply) => (
                            <div key={reply.id} className="reply">
                              <span className="reply-sender">{reply.sender.firstName}:</span>
                              <span className="reply-content">{reply.content}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="message-actions">
                        <button 
                          className="action-btn"
                          onClick={() => addReaction(message.id, '👍')}
                        >
                          <FaCheck />
                        </button>
                        <button 
                          className="action-btn"
                          onClick={() => addReaction(message.id, '❤️')}
                        >
                          <FaCheck />
                        </button>
                        <button className="action-btn">
                          <FaClock />
                        </button>
                        {message.sender.id === user.id && (
                          <>
                            <button className="action-btn">
                              <FaTimes />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              <div className="message-input-wrapper">
                <button 
                  className="btn-icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaPaperclip />
                </button>
                
                <div className="message-input">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows="1"
                  />
                </div>
                
                <button 
                  className="btn-icon"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <FaSmile />
                </button>
                
                <button 
                  className="btn btn-primary send-btn"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  <FaPaperPlane />
                </button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              />
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <h2>Select a Discussion</h2>
              <p>Choose a discussion from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </main>

      {/* Online Users Sidebar */}
      <aside className="online-users-sidebar">
        <div className="sidebar-header">
          <h3>Online Users</h3>
        </div>
        
        <div className="online-users-list">
          {onlineUsers.map((onlineUser) => (
            <div key={onlineUser.id} className="online-user-item">
              <div className="user-avatar">
                <img src={onlineUser.avatar} alt={`${onlineUser.firstName} ${onlineUser.lastName}`} />
                <div className={`status-indicator ${onlineUser.isOnline ? 'online' : 'offline'}`}>
                  <FaCircle />
                </div>
              </div>
              <div className="user-info">
                <span className="user-name">
                  {onlineUser.firstName} {onlineUser.lastName}
                </span>
                <span className="user-status">
                  {onlineUser.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Chat; 