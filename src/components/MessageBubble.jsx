import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ThumbsUp, ThumbsDown, RefreshCw, User, Sparkles, Image, FileText, File, Music, Video, Download } from 'lucide-react';
import './MessageBubble.css';

function AttachmentDisplay({ attachment }) {
  const getIcon = (type) => {
    switch (type) {
      case 'image': return Image;
      case 'document': return FileText;
      case 'audio': return Music;
      case 'video': return Video;
      default: return File;
    }
  };

  const IconComponent = getIcon(attachment.type);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="attachment-display">
      <div className="attachment-preview">
        {attachment.type === 'image' ? (
          <img src={attachment.url} alt={attachment.name} className="attachment-image" />
        ) : (
          <div className="attachment-file-icon">
            <IconComponent size={24} />
          </div>
        )}
      </div>
      <div className="attachment-details">
        <div className="attachment-name">{attachment.name}</div>
        <div className="attachment-size">{formatFileSize(attachment.size)}</div>
      </div>
      <button className="attachment-download" onClick={handleDownload} title="Download">
        <Download size={16} />
      </button>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className="copy-btn" onClick={handleCopy} title={copied ? 'Copied!' : 'Copy'}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">{language || 'code'}</span>
        <button className="code-copy-btn" onClick={handleCopy}>
          {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy code</>}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          fontSize: '13px',
          padding: '16px',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MessageBubble({ message, onRegenerate, isLast }) {
  const isUser = message.role === 'user';
  const [liked, setLiked] = useState(null);

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
      <div className="message-avatar">
        {isUser
          ? <div className="avatar user-avatar-icon"><User size={16} /></div>
          : <div className="avatar assistant-avatar-icon"><Sparkles size={16} /></div>
        }
      </div>

      <div className="message-content-wrapper">
        {/* Display attachments for user messages */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="message-attachments">
            {message.attachments.map(attachment => (
              <AttachmentDisplay key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}

        <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
          {isUser ? (
            <p className="user-text">{message.content}</p>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <CodeBlock
                        language={match[1]}
                        value={String(children).replace(/\n$/, '')}
                      />
                    ) : (
                      <code className="inline-code" {...props}>{children}</code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action buttons for assistant messages */}
        {!isUser && (
          <div className="message-actions">
            <CopyButton text={message.content} />
            <button
              className={`action-btn ${liked === 'up' ? 'active' : ''}`}
              onClick={() => setLiked(liked === 'up' ? null : 'up')}
              title="Good response"
            >
              <ThumbsUp size={14} />
            </button>
            <button
              className={`action-btn ${liked === 'down' ? 'active' : ''}`}
              onClick={() => setLiked(liked === 'down' ? null : 'down')}
              title="Bad response"
            >
              <ThumbsDown size={14} />
            </button>
            {isLast && onRegenerate && (
              <button className="action-btn" onClick={onRegenerate} title="Regenerate response">
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}