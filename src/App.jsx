import { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import SettingsModal from './components/SettingsModal';
import './App.css';

// Simulated AI response — replace with your real API call
async function fetchAIResponse(messages, signal) {
  // Simulate network delay
  await new Promise((res, rej) => {
    const t = setTimeout(res, 1000 + Math.random() * 800);
    signal?.addEventListener('abort', () => { clearTimeout(t); rej(new DOMException('Aborted', 'AbortError')); });
  });

  const last = messages[messages.length - 1].content.toLowerCase();

  if (last.includes('hello') || last.includes('hi')) {
    return "Hello! I'm ChatGPT, a large language model made by OpenAI. How can I help you today?";
  }
  if (last.includes('code') || last.includes('function') || last.includes('javascript')) {
    return "Here's a simple JavaScript example:\n\n```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('World')); // Hello, World!\n```\n\nThis function takes a `name` parameter and returns a greeting string using a template literal.";
  }
  if (last.includes('python')) {
    return "Here's a Python example:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nfor i in range(10):\n    print(fibonacci(i))\n```\n\nThis is a recursive Fibonacci implementation. For better performance with large numbers, consider using dynamic programming or memoization.";
  }

  return `I understand you're asking about: **"${messages[messages.length - 1].content}"**\n\nThis is a simulated response. To connect this UI to a real AI backend, replace the \`fetchAIResponse\` function in \`App.jsx\` with your actual API call.\n\nI can help you with:\n- Writing and debugging code\n- Explaining concepts\n- Answering questions\n- Creative writing\n- And much more!`;
}

function createChat(firstMessage = null) {
  return {
    id: uuidv4(),
    title: firstMessage ? firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '…' : '') : 'New chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export default function App() {
  const [chats, setChats] = useState([createChat()]);
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null
  });
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [isAccountSwitch, setIsAccountSwitch] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const abortRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // Apply initial theme
  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, []);

  const updateChat = useCallback((chatId, updater) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...updater(c), updatedAt: Date.now() } : c));
  }, []);

  const handleNewChat = () => {
    const chat = createChat();
    setChats(prev => [chat, ...prev]);
    setActiveChatId(chat.id);
  };

  const handleSelectChat = (id) => {
    if (isLoading) {
      abortRef.current?.abort();
      setIsLoading(false);
    }
    setActiveChatId(id);
  };

  const handleDeleteChat = (id) => {
    setChats(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (remaining.length === 0) {
        const fresh = createChat();
        setActiveChatId(fresh.id);
        return [fresh];
      }
      if (id === activeChatId) {
        setActiveChatId(remaining[0].id);
      }
      return remaining;
    });
  };

  const sendMessage = async (messageData, chatId = activeChatId) => {
    // Handle both old string format and new object format for backward compatibility
    const content = typeof messageData === 'string' ? messageData : messageData.text;
    const attachments = typeof messageData === 'object' ? messageData.attachments || [] : [];
    
    const userMsg = { 
      id: uuidv4(), 
      role: 'user', 
      content, 
      attachments,
      timestamp: Date.now() 
    };

    // Add user message & update title on first message
    setChats(prev => prev.map(c => {
      if (c.id !== chatId) return c;
      return {
        ...c,
        messages: [...c.messages, userMsg],
        title: c.messages.length === 0 ? content.slice(0, 40) + (content.length > 40 ? '…' : '') : c.title,
        updatedAt: Date.now(),
      };
    }));

    setIsLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const currentMessages = [...(chats.find(c => c.id === chatId)?.messages ?? []), userMsg];
      const reply = await fetchAIResponse(currentMessages, controller.signal);

      const assistantMsg = { id: uuidv4(), role: 'assistant', content: reply, timestamp: Date.now() };
      setChats(prev => prev.map(c => {
        if (c.id !== chatId) return c;
        return { ...c, messages: [...c.messages, assistantMsg], updatedAt: Date.now() };
      }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMsg = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: Date.now(),
        };
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, errorMsg] } : c));
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const handleRegenerate = () => {
    if (!activeChat || activeChat.messages.length < 1) return;
    // Remove the last assistant message and resend the last user message
    const msgs = activeChat.messages;
    const lastUserMsg = [...msgs].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;

    setChats(prev => prev.map(c => {
      if (c.id !== activeChatId) return c;
      // Drop everything after and including the last assistant message
      const trimmed = msgs.slice(0, msgs.lastIndexOf(msgs.slice().reverse().find(m => m.role === 'assistant')));
      return { ...c, messages: trimmed.length ? trimmed : msgs.filter(m => m.role === 'user') };
    }));

    sendMessage(lastUserMsg.content);
  };

  const handleLogout = () => {
    // Clear all chats and reset to initial state
    const newChat = createChat();
    setChats([newChat]);
    setActiveChatId(newChat.id);
    
    // Show login screen for account switching
    setIsAccountSwitch(false);
    setShowLoginScreen(true);
    
    console.log('User logged out');
  };

  const handleLogin = (userData) => {
    // Set the new user data
    setUser(userData);
    
    // Hide login screen
    setShowLoginScreen(false);
    setIsAccountSwitch(false);
    
    // If it's a logout (not account switch), create fresh chat
    if (!isAccountSwitch) {
      const newChat = createChat();
      setChats([newChat]);
      setActiveChatId(newChat.id);
    }
    
    console.log('User logged in:', userData);
  };

  const handleSwitchAccount = () => {
    // Show login screen without clearing chats (account switching)
    setIsAccountSwitch(true);
    setShowLoginScreen(true);
    console.log('Switch account requested');
  };

  const handleShowSettings = () => {
    setShowSettingsModal(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
    console.log('User updated:', updatedUser);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // Apply theme to body class for global styling
    document.body.className = `theme-${newTheme}`;
    console.log('Theme changed to:', newTheme);
  };

  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
    console.log('Language changed to:', languageCode);
    
    // Here you could add language-specific functionality like:
    // - Translating UI elements
    // - Changing AI model based on language
    // - Adjusting text direction for RTL languages
    
    // For demonstration, let's update the message placeholder
    if (languageCode === 'bn') {
      console.log('Bengali language selected');
    } else if (languageCode === 'hi') {
      console.log('Hindi language selected');
    } else if (languageCode === 'mr') {
      console.log('Marathi language selected');
    } else if (languageCode === 'or') {
      console.log('Odia language selected');
    } else {
      console.log('English language selected');
    }
  };

  const handleCloseLogin = () => {
    // Continue as current user without changing anything
    setShowLoginScreen(false);
    setIsAccountSwitch(false);
  };

  const hasMessages = activeChat?.messages.length > 0;

  return (
    <div className="app-layout">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        onLogout={handleLogout}
        onSwitchAccount={handleSwitchAccount}
        onShowSettings={handleShowSettings}
        user={user}
      />

      <div className="main-area">
        <Header
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />

        <div className="chat-area">
          {hasMessages ? (
            <ChatWindow
              messages={activeChat.messages}
              isLoading={isLoading}
              onRegenerate={handleRegenerate}
            />
          ) : (
            <WelcomeScreen onSuggestion={sendMessage} />
          )}

          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            onStop={handleStop}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>

      {/* Login Screen Overlay */}
      {showLoginScreen && (
        <LoginScreen
          onLogin={handleLogin}
          onClose={handleCloseLogin}
          isAccountSwitch={isAccountSwitch}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={handleCloseSettings}
          user={user}
          onUserUpdate={handleUserUpdate}
          onThemeChange={handleThemeChange}
          currentTheme={theme}
        />
      )}
    </div>
  );
}
