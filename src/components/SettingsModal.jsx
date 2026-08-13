import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Settings, 
  User, 
  Key, 
  Monitor, 
  Moon, 
  Sun, 
  Globe, 
  Save, 
  Eye, 
  EyeOff,
  Copy,
  RefreshCw,
  Trash2,
  Bell,
  Shield,
  Download,
  Upload
} from 'lucide-react';
import './SettingsModal.css';

export default function SettingsModal({ isOpen, onClose, user, onUserUpdate, onThemeChange, currentTheme }) {
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({
    // General Settings
    theme: currentTheme || 'dark',
    language: 'en',
    notifications: true,
    soundEffects: false,
    autoSave: true,
    compactMode: false,
    
    // API Settings
    apiKey: '',
    apiEndpoint: 'https://api.openai.com/v1',
    model: 'gpt-4',
    maxTokens: 2048,
    temperature: 0.7,
    
    // Account Settings
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || null
  });
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const fileInputRef = useRef(null);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'api', label: 'API', icon: Key },
    { id: 'account', label: 'Account', icon: User }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const handleClose = () => {
    if (unsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setUnsavedChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update user data if account settings changed
    if (activeTab === 'account') {
      onUserUpdate({
        name: settings.name,
        email: settings.email,
        bio: settings.bio,
        avatar: settings.avatar
      });
    }
    
    // Update theme if changed
    if (settings.theme !== currentTheme) {
      onThemeChange(settings.theme);
    }
    
    setUnsavedChanges(false);
    setIsLoading(false);
    
    // Show success message (you could add a toast notification here)
    console.log('Settings saved successfully');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleSettingChange('avatar', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateApiKey = () => {
    const newKey = 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    handleSettingChange('apiKey', newKey);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(settings.apiKey);
    // You could add a toast notification here
    console.log('API key copied to clipboard');
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chatgpt-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(prev => ({ ...prev, ...importedSettings }));
          setUnsavedChanges(true);
        } catch (error) {
          alert('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <div className="header-content">
            <h2>Settings</h2>
            <p>Customize your ChatGPT experience</p>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          {/* Tab Navigation */}
          <div className="settings-tabs">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <IconComponent size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="settings-panel">
            {activeTab === 'general' && (
              <div className="panel-content">
                <h3>General Settings</h3>
                
                <div className="setting-group">
                  <label>Theme</label>
                  <p className="setting-description">Choose how ChatGPT looks to you</p>
                  <div className="theme-selector">
                    <button
                      className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('theme', 'dark')}
                    >
                      <Moon size={16} />
                      Dark
                    </button>
                    <button
                      className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('theme', 'light')}
                    >
                      <Sun size={16} />
                      Light
                    </button>
                    <button
                      className={`theme-option ${settings.theme === 'auto' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('theme', 'auto')}
                    >
                      <Monitor size={16} />
                      Auto
                    </button>
                  </div>
                </div>

                <div className="setting-group">
                  <label>Language</label>
                  <select 
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="setting-select"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>

                <div className="setting-group">
                  <div className="setting-checkbox">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    />
                    <label htmlFor="notifications">
                      <Bell size={16} />
                      Enable notifications
                    </label>
                  </div>
                </div>

                <div className="setting-group">
                  <div className="setting-checkbox">
                    <input
                      type="checkbox"
                      id="soundEffects"
                      checked={settings.soundEffects}
                      onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                    />
                    <label htmlFor="soundEffects">
                      Sound effects
                    </label>
                  </div>
                </div>

                <div className="setting-group">
                  <div className="setting-checkbox">
                    <input
                      type="checkbox"
                      id="autoSave"
                      checked={settings.autoSave}
                      onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    />
                    <label htmlFor="autoSave">
                      Auto-save conversations
                    </label>
                  </div>
                </div>

                <div className="setting-group">
                  <div className="setting-checkbox">
                    <input
                      type="checkbox"
                      id="compactMode"
                      checked={settings.compactMode}
                      onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                    />
                    <label htmlFor="compactMode">
                      Compact mode
                    </label>
                  </div>
                </div>

                <div className="setting-group">
                  <label>Data Management</label>
                  <div className="data-buttons">
                    <button className="data-btn" onClick={exportSettings}>
                      <Download size={16} />
                      Export Settings
                    </button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importSettings}
                      style={{ display: 'none' }}
                      ref={fileInputRef}
                    />
                    <button className="data-btn" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={16} />
                      Import Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="panel-content">
                <h3>API Configuration</h3>
                
                <div className="setting-group">
                  <label>API Key</label>
                  <p className="setting-description">Your OpenAI API key for accessing GPT models</p>
                  <div className="api-key-input">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.apiKey}
                      onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                      placeholder="Enter your OpenAI API key"
                      className="setting-input"
                    />
                    <button
                      className="toggle-btn"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {settings.apiKey && (
                      <button className="copy-btn" onClick={copyApiKey}>
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                  <button className="generate-btn" onClick={generateApiKey}>
                    <RefreshCw size={16} />
                    Generate Test Key
                  </button>
                </div>

                <div className="setting-group">
                  <label>API Endpoint</label>
                  <input
                    type="url"
                    value={settings.apiEndpoint}
                    onChange={(e) => handleSettingChange('apiEndpoint', e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="setting-input"
                  />
                </div>

                <div className="setting-group">
                  <label>Model</label>
                  <select 
                    value={settings.model}
                    onChange={(e) => handleSettingChange('model', e.target.value)}
                    className="setting-select"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label>Max Tokens</label>
                  <div className="range-input">
                    <input
                      type="range"
                      min="256"
                      max="4096"
                      step="256"
                      value={settings.maxTokens}
                      onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                      className="setting-range"
                    />
                    <span className="range-value">{settings.maxTokens}</span>
                  </div>
                </div>

                <div className="setting-group">
                  <label>Temperature</label>
                  <div className="range-input">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                      className="setting-range"
                    />
                    <span className="range-value">{settings.temperature}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="panel-content">
                <h3>Account Settings</h3>
                
                <div className="setting-group">
                  <label>Profile Picture</label>
                  <div className="avatar-upload">
                    <div className="current-avatar">
                      {settings.avatar ? (
                        <img src={settings.avatar} alt="Profile" />
                      ) : (
                        <div className="default-avatar">
                          {settings.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                      id="avatar-upload"
                    />
                    <div className="avatar-buttons">
                      <label htmlFor="avatar-upload" className="upload-btn">
                        <Upload size={16} />
                        Upload Photo
                      </label>
                      {settings.avatar && (
                        <button
                          className="remove-btn"
                          onClick={() => handleSettingChange('avatar', null)}
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="setting-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => handleSettingChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="setting-input"
                  />
                </div>

                <div className="setting-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className="setting-input"
                  />
                </div>

                <div className="setting-group">
                  <label>Bio</label>
                  <textarea
                    value={settings.bio}
                    onChange={(e) => handleSettingChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="setting-textarea"
                    rows={3}
                  />
                </div>

                <div className="setting-group">
                  <label>Security</label>
                  <button className="security-btn">
                    <Shield size={16} />
                    Change Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <div className="footer-left">
            {unsavedChanges && (
              <span className="unsaved-indicator">Unsaved changes</span>
            )}
          </div>
          <div className="footer-right">
            <button className="cancel-btn" onClick={handleClose}>
              Cancel
            </button>
            <button 
              className="save-btn" 
              onClick={handleSave}
              disabled={!unsavedChanges || isLoading}
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}