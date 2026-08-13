import { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import './LoginScreen.css';

export default function LoginScreen({ onLogin, onClose, isAccountSwitch = false }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(null);
  const [errors, setErrors] = useState({});

  // Demo accounts for quick login
  const demoAccounts = [
    { name: 'John Doe', email: 'john.doe@example.com', avatar: null },
    { name: 'Jane Smith', email: 'jane.smith@company.com', avatar: null },
    { name: 'Alex Johnson', email: 'alex.j@startup.io', avatar: null },
    { name: 'Sarah Wilson', email: 's.wilson@design.com', avatar: null }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (isSignUp && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const userData = {
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
      avatar: null
    };

    onLogin(userData);
    setIsLoading(false);
  };

  const handleDemoLogin = (account) => {
    setIsLoading(true);
    setLoadingAccount(account.email);
    // Simulate a brief loading time for visual feedback
    setTimeout(() => {
      onLogin(account);
      setIsLoading(false);
      setLoadingAccount(null);
    }, 800);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        {onClose && (
          <button className="login-close-btn" onClick={onClose} title="Continue as guest">
            <ArrowLeft size={20} />
          </button>
        )}

        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">💬</div>
            <h1>ChatGPT</h1>
          </div>
          <h2>{isAccountSwitch ? 'Switch Account' : isSignUp ? 'Create your account' : 'Welcome back'}</h2>
          <p>
            {isAccountSwitch 
              ? 'Sign in with a different account to continue' 
              : isSignUp 
                ? 'Get started with ChatGPT today' 
                : 'Sign in to continue your conversation'
            }
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-field">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                  disabled={isLoading}
                />
              </div>
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'error' : ''}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                {isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <div className="demo-accounts">
          <h3>{isAccountSwitch ? 'Select Account' : 'Try Demo Accounts'}</h3>
          <div className="demo-accounts-grid">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                className={`demo-account-btn ${loadingAccount === account.email ? 'loading' : ''}`}
                onClick={() => handleDemoLogin(account)}
                disabled={isLoading}
              >
                <div className="demo-avatar">
                  {loadingAccount === account.email ? (
                    <div className="loading-spinner small"></div>
                  ) : (
                    account.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  )}
                </div>
                <div className="demo-info">
                  <span className="demo-name">{account.name}</span>
                  <span className="demo-email">{account.email}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="login-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" className="toggle-mode-btn" onClick={toggleMode} disabled={isLoading}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}