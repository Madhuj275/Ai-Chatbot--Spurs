import React, { useState, useEffect } from 'react';
import ChatWidget from './components/ChatWidget';
import { Message } from './types';
import { chatAPI } from './services/api';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Load session ID from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      loadConversationHistory(savedSessionId);
    }
  }, []);

  const loadConversationHistory = async (savedSessionId: string) => {
    try {
      const history = await chatAPI.getConversationHistory(savedSessionId);
      setMessages(history.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })));
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      // If loading fails, start fresh conversation
      localStorage.removeItem('chatSessionId');
      setSessionId(undefined);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage({
        message: messageText,
        sessionId,
      });

      // Save session ID for future messages
      if (!sessionId) {
        setSessionId(response.sessionId);
        localStorage.setItem('chatSessionId', response.sessionId);
      }

      // Update messages with the new exchange
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: messageText,
        timestamp: new Date(),
      };

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    localStorage.removeItem('chatSessionId');
    setSessionId(undefined);
    setMessages([]);
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>AI Support Chat</h1>
        <div className="header-actions">
          <button onClick={handleClearChat} className="clear-button">
            Clear Chat
          </button>
        </div>
      </div>
      
      <div className="app-content">
        <div className="chat-container">
          <ChatWidget
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
        
        <div className="info-panel">
          <h2>About This Demo</h2>
          <p>
            This is an AI-powered customer support chat widget that can answer questions about:
          </p>
          <ul>
            <li>Shipping policies and costs</li>
            <li>Return and refund policies</li>
            <li>Support hours</li>
            <li>Product information</li>
          </ul>
          
          <h3>Try asking:</h3>
          <div className="example-questions">
            <button onClick={() => handleSendMessage("What's your return policy?")}>
              What's your return policy?
            </button>
            <button onClick={() => handleSendMessage("Do you ship to USA?")}>
              Do you ship to USA?
            </button>
            <button onClick={() => handleSendMessage("What are your support hours?")}>
              What are your support hours?
            </button>
            <button onClick={() => handleSendMessage("How much is shipping?")}>
              How much is shipping?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;