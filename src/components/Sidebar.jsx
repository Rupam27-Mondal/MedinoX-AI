import { useState, useRef, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Search, MoreHorizontal, User, Settings, LogOut, Moon, Sun, HelpCircle, ChevronDown, Users } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, collapsed, onToggleCollapse, onLogout, onSwitchAccount, onShowSettings, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredChat, setHoveredChat] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleUserDropdownToggle = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    // Here you could implement actual theme switching logic
    document.body.classList.toggle('light-mode', !darkMode);
  };

  const handleSettings = () => {
    setShowUserDropdown(false);
    if (onShowSettings) {
      onShowSettings();
    }
  };

  const handleSwitchAccount = () => {
    setShowUserDropdown(false);
    if (onSwitchAccount) {
      onSwitchAccount();
    }
  };

  const handleHelp = () => {
    setShowUserDropdown(false);
    // Add help functionality here
    console.log('Help clicked');
  };

  // Get user initials from name or email
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const filtered = chats.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group chats by time
  const now = Date.now();
  const today = filtered.filter(c => now - c.updatedAt < 86400000);
  const yesterday = filtered.filter(c => now - c.updatedAt >= 86400000 && now - c.updatedAt < 172800000);
  const previous = filtered.filter(c => now - c.updatedAt >= 172800000);

  const renderGroup = (label, items) => {
    if (!items.length) return null;
    return (
      <div className="chat-group" key={label}>
        <p className="chat-group-label">{label}</p>
        {items.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
            onClick={() => onSelectChat(chat.id)}
            onMouseEnter={() => setHoveredChat(chat.id)}
            onMouseLeave={() => setHoveredChat(null)}
          >
            <MessageSquare size={15} className="chat-item-icon" />
            <span className="chat-item-title">{chat.title}</span>
            {(hoveredChat === chat.id || chat.id === activeChatId) && (
              <button
                className="chat-item-delete"
                onClick={e => { e.stopPropagation(); onDeleteChat(chat.id); }}
                title="Delete chat"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (collapsed) {
    return (
      <aside className="sidebar sidebar-collapsed">
        <button className="collapse-btn" onClick={onToggleCollapse} title="Expand sidebar">
          <ChevronRight size={18} />
        </button>
        <button className="new-chat-icon-btn" onClick={onNewChat} title="New chat">
          <Plus size={18} />
        </button>
        
        {/* Collapsed user info */}
        <div className="collapsed-user-info">
          <div className="user-avatar collapsed-avatar" title={user?.name || user?.email || 'User'}>
            {getUserInitials()}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="collapse-btn" onClick={onToggleCollapse} title="Collapse sidebar">
          <ChevronLeft size={18} />
        </button>
        <button className="new-chat-btn" onClick={onNewChat}>
          <Plus size={16} />
          <span>New chat</span>
        </button>
      </div>

      <div className="sidebar-search">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Search chats"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="chat-list">
        {renderGroup('Today', today)}
        {renderGroup('Yesterday', yesterday)}
        {renderGroup('Previous 7 Days', previous)}
        {filtered.length === 0 && (
          <p className="no-chats">No chats found</p>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-dropdown-container" ref={dropdownRef}>
          <div 
            className="user-info" 
            onClick={handleUserDropdownToggle}
            role="button"
            tabIndex={0}
            aria-expanded={showUserDropdown}
            aria-haspopup="menu"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleUserDropdownToggle();
              }
            }}
          >
            <div className="user-avatar">{getUserInitials()}</div>
            <div className="user-details">
              <span className="user-name">{user?.name || user?.email || 'User'}</span>
              {user?.email && user?.name && (
                <span className="user-email">{user.email}</span>
              )}
            </div>
            <ChevronDown size={16} className={`user-dropdown-arrow ${showUserDropdown ? 'rotated' : ''}`} />
          </div>

          {showUserDropdown && (
            <div className="user-dropdown" role="menu" aria-label="User options">
              <div className="dropdown-section">
                <button className="dropdown-item" onClick={handleSwitchAccount} role="menuitem">
                  <Users size={16} />
                  <span>Switch Account</span>
                </button>
                <button className="dropdown-item" onClick={handleSettings} role="menuitem">
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button className="dropdown-item" onClick={handleDarkModeToggle} role="menuitem">
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
                </button>
                <button className="dropdown-item" onClick={handleHelp} role="menuitem">
                  <HelpCircle size={16} />
                  <span>Help & Support</span>
                </button>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-section">
                <button className="dropdown-item logout-item" onClick={handleLogout} role="menuitem">
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
