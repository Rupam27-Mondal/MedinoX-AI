import { Sparkles } from 'lucide-react';
import './TypingIndicator.css';

export default function TypingIndicator() {
  return (
    <div className="typing-row">
      <div className="message-avatar">
        <div className="avatar assistant-avatar-icon">
          <Sparkles size={16} />
        </div>
      </div>
      <div className="typing-dots">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}
