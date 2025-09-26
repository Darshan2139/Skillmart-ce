import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AiOutlineSend, AiOutlineClose, AiOutlineClear, AiOutlineCopy } from 'react-icons/ai';
import { BsChatDotsFill, BsRobot } from 'react-icons/bs';
import { FaGraduationCap, FaBookOpen } from 'react-icons/fa';
import { sendMessageToBot } from '../../../services/operations/chatbotAPI';
import { sendMessageToBotEnhanced, getProjectInfo } from '../../../services/operations/projectInfoAPI';
import { toast } from 'react-hot-toast';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm the SkillMart Study Adviser Bot. I'm here to help you with study questions, academic problems, and SkillMart platform navigation. I can help you understand how to use different features, navigate the dashboard, manage courses, work with assignments, and much more. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load project information when chatbot opens
  useEffect(() => {
    if (isOpen && !projectInfo) {
      loadProjectInfo();
    }
  }, [isOpen, projectInfo]);

  const loadProjectInfo = async () => {
    try {
      const response = await getProjectInfo();
      if (response.success) {
        setProjectInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to load project info:', error);
    }
  };

  const handleQuickAction = (action) => {
    let message = '';
    switch (action) {
      case 'dashboard':
        message = 'How do I navigate the dashboard? What features are available for students and instructors?';
        break;
      case 'assignments':
        message = 'How does the assignment system work? How do I create, submit, or grade assignments?';
        break;
      case 'courses':
        message = 'How do I create courses, manage course content, and organize sections?';
        break;
      case 'features':
        message = 'What are all the features available on the SkillMart platform?';
        break;
      default:
        message = `Tell me about ${action}`;
    }
    
    setInputMessage(message);
    setShowQuickActions(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Try enhanced API first, fallback to regular API
      let response;
      try {
        response = await sendMessageToBotEnhanced(inputMessage);
      } catch (enhancedError) {
        console.log('Enhanced API failed, trying regular API:', enhancedError);
        response = await sendMessageToBot(inputMessage);
      }

      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');

      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = useCallback(() => {
    if (messages.length > 1) {
      const confirmed = window.confirm('Are you sure you want to clear the chat? This action cannot be undone.');
      if (confirmed) {
        setMessages([
          {
            id: 1,
            text: "Hello! I'm the SkillMart Study Adviser Bot. I'm here to help you with study questions, academic problems, and SkillMart platform features. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date()
          }
        ]);
        toast.success('Chat cleared successfully!');
      }
    } else {
      toast('Chat is already empty!', {
        icon: 'ℹ️',
        style: {
          background: '#3B82F6',
          color: '#fff',
        },
      });
    }
  }, [messages.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.ctrlKey) {
        if (e.key === 'k') {
          e.preventDefault();
          handleClearChat();
        } else if (e.key === 'c') {
          e.preventDefault();
          const lastBotMessage = messages.filter(msg => msg.sender === 'bot').pop();
          if (lastBotMessage) {
            handleCopyMessage(lastBotMessage.text, lastBotMessage.id);
          } else {
            toast('No bot message to copy', {
              icon: 'ℹ️',
              style: {
                background: '#3B82F6',
                color: '#fff',
              },
            });
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClearChat, messages]);

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessage = (text) => {
    let formattedText = text;
    
    // Convert **text** to <strong>text</strong> for bold formatting
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-caribbeangreen-400">$1</strong>');
    
    // Convert *text* to <em>text</em> for italic formatting
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em class="italic text-blue-300">$1</em>');
    
    // Convert `code` to <code>code</code> for inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-richblack-800 text-caribbeangreen-300 px-2 py-1 rounded text-sm font-mono">$1</code>');
    
    // Convert ```code``` to <pre><code>code</code></pre> for code blocks
    formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre class="bg-richblack-800 border border-richblack-600 rounded-lg p-4 my-3 overflow-x-auto"><code class="text-caribbeangreen-300 text-sm font-mono">$1</code></pre>');
    
    // Convert numbered lists (1. item)
    formattedText = formattedText.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="flex items-start my-2"><span class="bg-caribbeangreen-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mr-3 mt-0.5 flex-shrink-0">$1</span><span class="text-richblack-5">$2</span></div>');
    
    // Convert bullet points (- item or * item)
    formattedText = formattedText.replace(/^[-*]\s+(.+)$/gm, '<div class="flex items-start my-2"><span class="text-caribbeangreen-400 text-lg mr-3 mt-0.5">•</span><span class="text-richblack-5">$1</span></div>');
    
    // Convert ## Headers to styled headers
    formattedText = formattedText.replace(/^##\s+(.+)$/gm, '<h3 class="text-lg font-semibold text-caribbeangreen-400 mt-4 mb-2 border-b border-richblack-600 pb-1">$1</h3>');
    
    // Convert # Headers to styled headers
    formattedText = formattedText.replace(/^#\s+(.+)$/gm, '<h2 class="text-xl font-bold text-caribbeangreen-300 mt-6 mb-3 border-b-2 border-caribbeangreen-500 pb-2">$1</h2>');
    
    // Convert line breaks to <br> tags
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    // Add spacing between paragraphs
    formattedText = formattedText.replace(/(<br>\s*){2,}/g, '<br><br>');
    
    // Wrap the content in a container for better styling
    formattedText = `<div class="chatbot-content">${formattedText}</div>`;
    
    return { __html: formattedText };
  };

  const handleCopyMessage = async (text, messageId) => {
    try {
      // Remove HTML tags for plain text copy
      const plainText = text.replace(/<[^>]*>/g, '');
      await navigator.clipboard.writeText(plainText);
      
      // Show visual feedback
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
      
      toast.success('Message copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast.error('Failed to copy message');
    }
  };

  const handleCopyAllMessages = async () => {
    try {
      const conversationText = messages
        .map(msg => {
          const sender = msg.sender === 'user' ? 'You' : 'Bot';
          const plainText = msg.text.replace(/<[^>]*>/g, '');
          return `${sender}: ${plainText}`;
        })
        .join('\n\n');
      
      await navigator.clipboard.writeText(conversationText);
      toast.success('Entire conversation copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy conversation:', error);
      toast.error('Failed to copy conversation');
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Floating animation ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-caribbeangreen-500 to-blue-500 animate-ping opacity-20"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-caribbeangreen-500 to-blue-500 animate-pulse opacity-30"></div>
          
          <button
            onClick={() => setIsOpen(true)}
            className="relative bg-gradient-to-r from-caribbeangreen-500 to-blue-500 hover:from-caribbeangreen-400 hover:to-blue-400 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group"
            title="Open SkillMart Study Adviser Bot"
          >
            <div className="relative">
              <BsChatDotsFill className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
            </div>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-richblack-800 rounded-xl shadow-2xl border border-richblack-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-caribbeangreen-500 to-blue-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FaGraduationCap className="w-6 h-6" />
                <BsRobot className="w-4 h-4 absolute -bottom-1 -right-1 text-yellow-400" />
              </div>
              <div>
                <span className="font-semibold text-lg">Study Adviser</span>
                <p className="text-xs text-caribbeangreen-100">
                  SkillMart AI Assistant
                  {messages.length > 1 && (
                    <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                      {messages.length - 1} messages
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {messages.length > 1 && (
                <button
                  onClick={handleCopyAllMessages}
                  className="text-white hover:text-richblack-100 transition-colors p-2 rounded-lg hover:bg-white/20"
                  title="Copy All Messages"
                >
                  <AiOutlineCopy className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleClearChat}
                className="text-white hover:text-richblack-100 transition-colors p-2 rounded-lg hover:bg-white/20"
                title="Clear Chat (Ctrl+K)"
              >
                <AiOutlineClear className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-richblack-100 transition-colors p-2 rounded-lg hover:bg-white/20"
                title="Close Chat"
              >
                <AiOutlineClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          {projectInfo && (
            <div className="px-4 py-2 bg-richblack-800 border-b border-richblack-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-caribbeangreen-400">Quick Actions</span>
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="text-xs text-richblack-400 hover:text-richblack-200 transition-colors"
                >
                  {showQuickActions ? 'Hide' : 'Show'}
                </button>
              </div>
              {showQuickActions && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickAction('dashboard')}
                    className="text-xs bg-richblack-700 hover:bg-richblack-600 text-richblack-200 px-3 py-2 rounded-lg transition-colors"
                  >
                    📊 Dashboard
                  </button>
                  <button
                    onClick={() => handleQuickAction('assignments')}
                    className="text-xs bg-richblack-700 hover:bg-richblack-600 text-richblack-200 px-3 py-2 rounded-lg transition-colors"
                  >
                    📝 Assignments
                  </button>
                  <button
                    onClick={() => handleQuickAction('courses')}
                    className="text-xs bg-richblack-700 hover:bg-richblack-600 text-richblack-200 px-3 py-2 rounded-lg transition-colors"
                  >
                    🎓 Courses
                  </button>
                  <button
                    onClick={() => handleQuickAction('features')}
                    className="text-xs bg-richblack-700 hover:bg-richblack-600 text-richblack-200 px-3 py-2 rounded-lg transition-colors"
                  >
                    ⚡ Features
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-richblack-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-xl relative group ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-caribbeangreen-500 text-white'
                      : 'bg-richblack-700 text-richblack-5 border border-richblack-600 shadow-lg'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="flex items-center mb-2 pb-2 border-b border-richblack-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-caribbeangreen-500 to-blue-500 rounded-full flex items-center justify-center">
                          <BsRobot className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-caribbeangreen-400">AI Assistant</span>
                      </div>
                    </div>
                  )}
                  <div 
                    className={`text-sm leading-relaxed ${
                      message.sender === 'bot' ? 'chatbot-message' : ''
                    }`}
                    dangerouslySetInnerHTML={formatMessage(message.text)}
                  ></div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </p>
                    {message.sender === 'bot' && (
                      <button
                        onClick={() => handleCopyMessage(message.text, message.id)}
                        className={`opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded text-richblack-300 hover:text-richblack-100 ${
                          copiedMessageId === message.id 
                            ? 'bg-caribbeangreen-500 text-white opacity-100' 
                            : 'hover:bg-richblack-600'
                        }`}
                        title="Copy message (Ctrl+C for last bot message)"
                      >
                        {copiedMessageId === message.id ? (
                          <span className="text-xs">✓</span>
                        ) : (
                          <AiOutlineCopy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-richblack-700 text-richblack-5 p-4 rounded-xl border border-richblack-600 shadow-lg max-w-[85%]">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <FaBookOpen className="w-5 h-5 text-caribbeangreen-400 animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-caribbeangreen-400 rounded-full animate-ping"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-caribbeangreen-400">AI is thinking...</span>
                      <div className="flex space-x-1 mt-1">
                        <div className="w-2 h-2 bg-caribbeangreen-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-caribbeangreen-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-caribbeangreen-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-richblack-700 bg-richblack-800">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about studying or SkillMart..."
                className="flex-1 p-3 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-caribbeangreen-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-caribbeangreen-500 to-blue-500 hover:from-caribbeangreen-400 hover:to-blue-400 disabled:from-richblack-600 disabled:to-richblack-600 text-white p-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                <AiOutlineSend className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
