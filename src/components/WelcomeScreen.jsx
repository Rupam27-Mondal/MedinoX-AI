import './WelcomeScreen.css';

const SUGGESTIONS = [
  { icon: '💡', title: 'Explain a concept', prompt: 'Explain how neural networks work in simple terms' },
  { icon: '✍️', title: 'Write something', prompt: 'Write a short story about a robot learning to paint' },
  { icon: '🐛', title: 'Debug code', prompt: 'Help me debug this JavaScript function' },
  { icon: '📊', title: 'Analyze data', prompt: 'How do I analyze trends in a CSV file with Python?' },
];

export default function WelcomeScreen({ onSuggestion }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1 className="welcome-title">Welcome to MediNox-AI , How can I help you ?</h1>

        <div className="suggestions-grid">
          {SUGGESTIONS.map(s => (
            <button
              key={s.title}
              className="suggestion-card"
              onClick={() => onSuggestion(s.prompt)}
            >
              <span className="suggestion-icon">{s.icon}</span>
              <div>
                <p className="suggestion-title">{s.title}</p>
                <p className="suggestion-desc">{s.prompt}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
