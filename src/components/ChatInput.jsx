import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp, Square, Paperclip, Mic, MicOff, Globe, Image, FileText, File, Music, Video, ChevronDown, Languages } from 'lucide-react';
import './ChatInput.css';

export default function ChatInput({ onSend, isLoading, onStop, selectedLanguage = 'en', onLanguageChange }) {
  const [value, setValue] = useState('');
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const textareaRef = useRef(null);
  const attachmentDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const recognitionRef = useRef(null);
  const interimValueRef = useRef('');
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

  // Map app language ids to BCP-47 codes for SpeechRecognition
  const langToBCP47 = {
    bn: 'bn-BD',
    hi: 'hi-IN',
    mr: 'mr-IN',
    or: 'or-IN',
    en: 'en-US',
  };

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    interimValueRef.current = '';
  }, []);

  const startRecording = useCallback(() => {
    setVoiceError('');
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langToBCP47[selectedLanguage] || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognitionRef.current = recognition;

    // Snapshot of text already in box before recording starts
    const baseText = value;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      // Append finalized text to base; show interim as a live preview
      if (final) {
        interimValueRef.current = (interimValueRef.current + final).trimStart();
      }
      const display =
        (baseText ? baseText + ' ' : '') +
        interimValueRef.current +
        interim;
      setValue(display.trimStart());
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceError('Microphone access denied. Allow mic permission and try again.');
      } else if (event.error !== 'aborted') {
        setVoiceError('Voice recognition error. Please try again.');
      }
      stopRecording();
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
      interimValueRef.current = '';
    };

    recognition.start();
  }, [selectedLanguage, value, stopRecording]);

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Stop recording if language changes mid-session
  useEffect(() => {
    if (isRecording) stopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
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

    // Stop recording before sending
    if (isRecording) stopRecording();
    
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

        {/* Voice error banner */}
        {voiceError && (
          <div className="voice-error-banner" role="alert">
            <MicOff size={14} />
            <span>{voiceError}</span>
            <button className="voice-error-close" onClick={() => setVoiceError('')} aria-label="Dismiss">×</button>
          </div>
        )}

        <div className="input-box">
          {/* Top row: textarea */}
          <textarea
            ref={textareaRef}
            className="message-textarea"
            placeholder="Message MediNox"
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

              <button
                className={`tool-btn mic-btn ${isRecording ? 'recording' : ''}`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
                disabled={isLoading}
                onClick={handleVoiceToggle}
                aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
                aria-pressed={isRecording}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                {isRecording && <span className="recording-pulse" aria-hidden="true" />}
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
        MediNox can make mistakes. Consider checking important information.
        {selectedLanguage !== 'en' && (
          <span className="language-note"> • Language: {getSelectedLanguage().label}</span>
        )}
      </p>
    </div>
  );
}
