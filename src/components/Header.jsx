import { ChevronDown, Sun, Moon } from 'lucide-react';
import './Header.css';

const MODELS = ['GPT-4o', 'GPT-4o mini', 'GPT-4', 'GPT-3.5'];

export default function Header({ selectedModel, onModelChange, theme, onThemeChange }) {
  const isLight = theme === 'light';

  const toggleTheme = () => {
    onThemeChange(isLight ? 'dark' : 'light');
  };

  return (
    <header className="chat-header">
      <div className="model-selector-wrapper">
        <div className="model-selector" tabIndex={0} role="combobox" aria-label="Select model">
          <span className="model-name">{selectedModel}</span>
          <ChevronDown size={14} className="model-chevron" />

          <div className="model-dropdown">
            {MODELS.map(m => (
              <button
                key={m}
                className={`model-option ${m === selectedModel ? 'selected' : ''}`}
                onClick={() => onModelChange(m)}
              >
                {m}
                {m === selectedModel && <span className="model-check">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isLight ? 'Switch to Dark mode' : 'Switch to Light mode'}
          aria-label={isLight ? 'Switch to Dark mode' : 'Switch to Light mode'}
        >
          {isLight ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </div>
    </header>
  );
}
