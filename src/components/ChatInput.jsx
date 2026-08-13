import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, Paperclip, Mic, Globe, Image, FileText, File, Music, Video, ChevronDown, Languages } from 'lucide-react';
import './ChatInput.css';

export default function ChatInput({ onSend, isLoading, onStop, selectedLanguage = 'en', onLanguageChange }) {
  const [value, setValue] = useState('');
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const textareaRef = useRef(null);
  const attachmentDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const fileInputRefs = useRef({
    image: null,
    document: null,
    file: null,
    audio: null,
    video: null
  });

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [value]);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachmentDropdownRef.current && !attachmentDropdownRef.current.contains(event.target)) {
        setShowAttachmentDropdown(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowAttachmentDropdown(false);
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const attachmentTypes = [
    {
      id: 'image',
      label: 'Image',
      icon: Image,
      accept: 'image/*',
      description: 'PNG, JPG, GIF, WebP'
    },
    {
      id: 'document', 
      label: 'Document',
      icon: FileText,
      accept: '.pdf,.doc,.docx,.txt,.rtf',
      description: 'PDF, DOC, TXT, RTF'
    },
    {
      id: 'file',
      label: 'File',
      icon: File,
      accept: '*',
      description: 'Any file type'
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: Music,
      accept: 'audio/*',
      description: 'MP3, WAV, OGG, M4A'
    },
    {
      id: 'video',
      label: 'Video',
      icon: Video,
      accept: 'video/*',
      description: 'MP4, AVI, MOV, WebM'
    }
  ];

  const languages = [
    { id: 'bn', code: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
    { id: 'hi', code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { id: 'mr', code: 'mr', label: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { id: 'or', code: 'or', label: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { id: 'en', code: 'en', label: 'English', nativeName: 'English', flag: '🇺🇸' }
  ];

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    
    // Include attached files in the message
    const messageData = {
      text: trimmed,
      attachments: attachedFiles
    };
    
    onSend(messageData);
    setValue('');
    setAttachedFiles([]);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachmentClick = () => {
    setShowAttachmentDropdown(!showAttachmentDropdown);
    setShowLanguageDropdown(false);
  };

  const handleLanguageClick = () => {
    setShowLanguageDropdown(!showLanguageDropdown);
    setShowAttachmentDropdown(false);
  };

  const handleLanguageSelect = (language) => {
    setShowLanguageDropdown(false);
    if (onLanguageChange) {
      onLanguageChange(language.id);
    }
  };

  const handleFileTypeSelect = (type) => {
    const input = fileInputRefs.current[type.id];
    if (input) {
      input.click();
    }
    setShowAttachmentDropdown(false);
  };

  const handleFileChange = (event, type) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: type.id,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    setAttachedFiles(prev => [...prev, ...newAttachments]);
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const removeAttachment = (id) => {
    setAttachedFiles(prev => {
      const updated = prev.filter(file => file.id !== id);
      // Clean up object URLs to prevent memory leaks
      const removed = prev.find(file => file.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return updated;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSelectedLanguage = () => {
    return languages.find(lang => lang.id === selectedLanguage) || languages[languages.length - 1]; // Default to English
  };

  return (
    <div className="chat-input-area">
      <div className="input-container">
        {/* File attachments display */}
        {attachedFiles.length > 0 && (
          <div className="attachments-display">
            {attachedFiles.map(attachment => (
              <div key={attachment.id} className="attachment-item">
                <div className="attachment-icon">
                  {attachment.type === 'image' && <Image size={16} />}
                  {attachment.type === 'document' && <FileText size={16} />}
                  {attachment.type === 'file' && <File size={16} />}
                  {attachment.type === 'audio' && <Music size={16} />}
                  {attachment.type === 'video' && <Video size={16} />}
                </div>
                <div className="attachment-info">
                  <span className="attachment-name">{attachment.name}</span>
                  <span className="attachment-size">{formatFileSize(attachment.size)}</span>
                </div>
                <button 
                  className="attachment-remove"
                  onClick={() => removeAttachment(attachment.id)}
                  title="Remove attachment"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="input-box">
          {/* Top row: textarea */}
          <textarea
            ref={textareaRef}
            className="message-textarea"
            placeholder="Message ChatGPT"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
            aria-label="Message input"
          />

          {/* Bottom row: tools + send */}
          <div className="input-toolbar">
            <div className="input-tools-left">
              <div className="attachment-dropdown-container" ref={attachmentDropdownRef}>
                <button 
                  className="tool-btn attachment-btn" 
                  title="Attach file" 
                  disabled={isLoading}
                  onClick={handleAttachmentClick}
                >
                  <Paperclip size={16} />
                  <ChevronDown size={12} className="dropdown-arrow" />
                </button>
                
                {showAttachmentDropdown && (
                  <div className="attachment-dropdown">
                    {attachmentTypes.map(type => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          className="dropdown-item"
                          onClick={() => handleFileTypeSelect(type)}
                        >
                          <div className="dropdown-item-icon">
                            <IconComponent size={18} />
                          </div>
                          <div className="dropdown-item-content">
                            <span className="dropdown-item-label">{type.label}</span>
                            <span className="dropdown-item-description">{type.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Hidden file inputs */}
                {attachmentTypes.map(type => (
                  <input
                    key={type.id}
                    type="file"
                    ref={el => fileInputRefs.current[type.id] = el}
                    accept={type.accept}
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileChange(e, type)}
                  />
                ))}
              </div>

              <div className="language-dropdown-container" ref={languageDropdownRef}>
                <button 
                  className="tool-btn language-btn" 
                  title="Select language" 
                  disabled={isLoading}
                  onClick={handleLanguageClick}
                  aria-expanded={showLanguageDropdown}
                  aria-haspopup="listbox"
                  aria-label={`Select language, current: ${getSelectedLanguage().label}`}
                >
                  <Languages size={16} />
                  <div className="language-indicator" aria-hidden="true">
                    {getSelectedLanguage().flag}
                  </div>
                  <ChevronDown size={12} className="dropdown-arrow" />
                </button>
                
                {showLanguageDropdown && (
                  <div className="language-dropdown" role="listbox" aria-label="Language selection">
                    {languages.map(language => (
                      <button
                        key={language.id}
                        className={`dropdown-item ${selectedLanguage === language.id ? 'selected' : ''}`}
                        onClick={() => handleLanguageSelect(language)}
                        role="option"
                        aria-selected={selectedLanguage === language.id}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleLanguageSelect(language);
                          }
                        }}
                      >
                        <div className="language-flag" aria-hidden="true">
                          {language.flag}
                        </div>
                        <div className="language-content">
                          <span className="language-label">{language.label}</span>
                          <span className="language-native">{language.nativeName}</span>
                        </div>
                        {selectedLanguage === language.id && (
                          <div className="language-checkmark" aria-hidden="true">✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="tool-btn" title="Voice input" disabled={isLoading}>
                <Mic size={16} />
              </button>
            </div>

            <div className="input-tools-right">
              {isLoading ? (
                <button className="send-btn stop-btn" onClick={onStop} title="Stop generating">
                  <Square size={14} fill="currentColor" />
                </button>
              ) : (
                <button
                  className={`send-btn ${(value.trim() || attachedFiles.length > 0) ? 'active' : ''}`}
                  onClick={handleSend}
                  disabled={!value.trim() && attachedFiles.length === 0}
                  title="Send message"
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="disclaimer">
        Our model-name can make mistakes. Consider checking important information.
        {selectedLanguage !== 'en' && (
          <span className="language-note"> • Language: {getSelectedLanguage().label}</span>
        )}
      </p>
    </div>
  );
}
