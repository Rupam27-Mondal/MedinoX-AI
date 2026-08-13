import { ChevronDown, Share, MoreHorizontal } from 'lucide-react';
import './Header.css';

const MODELS = ['GPT-4o', 'GPT-4o mini', 'GPT-4', 'GPT-3.5'];

export default function Header({ selectedModel, onModelChange }) {
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
        <button className="header-btn" title="Share">
          <Share size={16} />
          <span>Share</span>
        </button>
        <button className="header-icon-btn" title="More options">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </header>
  );
}
