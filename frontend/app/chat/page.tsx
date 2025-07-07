'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import type { ReactNode } from 'react';
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import FileUpload from '../components/PDFUpload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'error';
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '👏'];

const beep = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square';
  o.frequency.value = 440;
  o.connect(g);
  g.connect(ctx.destination);
  g.gain.value = 0.05;
  o.start();
  o.stop(ctx.currentTime + 0.1);
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const shouldGroupMessages = (current: Message, previous: Message | undefined) => {
  if (!previous) return false;
  const timeDiff = current.timestamp.getTime() - previous.timestamp.getTime();
  return timeDiff < 60000 && current.role === previous.role;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasFiles, setHasFiles] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = 6 * 24; // 6 lines * 24px line-height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [input]);

  const handleFilesUploaded = (hasFiles: boolean) => {
    setHasFiles(hasFiles);
    if (!hasFiles) setRagEnabled(false);
  };

  const handleRAGToggle = (rag: boolean) => {
    setRagEnabled(rag);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    beep();
    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date(),
      status: 'sending'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: input,
        use_rag: ragEnabled && hasFiles
      });
      
      // Update user message status
      setMessages(prev => prev.map(msg => 
        msg === userMessage ? { ...msg, status: 'delivered' } : msg
      ));
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        status: 'sent'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      beep();
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg === userMessage ? { ...msg, status: 'error' } : msg
      ));
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        status: 'sent'
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const addReaction = (messageIndex: number, emoji: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const message = newMessages[messageIndex];
      const reactions = message.reactions || [];
      const existingReaction = reactions.find(r => r.emoji === emoji);
      
      if (existingReaction) {
        existingReaction.count += 1;
      } else {
        reactions.push({ emoji, count: 1 });
      }
      
      message.reactions = reactions;
      return newMessages;
    });
    setShowReactionPicker(null);
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return '🔄';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'error':
        return '❌';
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-dark text-white p-4 font-orbitron">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-4">
          <span className="block w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue shadow-neon animate-neon-pulse flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="#00ffff" strokeWidth="3" fill="#0a0a0a" />
              <text x="16" y="22" textAnchor="middle" fontSize="16" fill="#ff00ff" fontFamily="Orbitron, sans-serif">🤖</text>
            </svg>
          </span>
          <h1 className="text-5xl font-extrabold text-neon-blue animate-neon-pulse drop-shadow-neon">AIMakerSpace Assistant</h1>
        </div>
        <p className="text-neon-pink text-lg mt-2">Your AI Engineering Bootcamp Tutor</p>
      </div>

      <div className="w-full max-w-2xl bg-dark border-2 border-neon-pink rounded-lg shadow-neon p-4 mb-4 h-[50vh] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neon-blue">
            <span className="text-6xl animate-neon-pulse">🎓</span>
            <p className="text-xl font-orbitron">Welcome to AIMakerSpace!</p>
            <p className="text-sm text-gray-400 mt-2 text-center">
              Upload your bootcamp materials (PDF, DOCX, TXT) and ask me anything about assignments, concepts, or course content.
            </p>
            {hasFiles && (
              <p className="text-sm text-neon-green mt-2">
                Files loaded! Toggle RAG to chat with your materials.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const previousMessage = messages[index - 1];
              const showAvatar = !shouldGroupMessages(message, previousMessage);
              
              return (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
                    shouldGroupMessages(message, previousMessage) ? 'mt-1' : 'mt-4'
                  }`}
                >
                  {message.role === 'assistant' && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-neon-blue flex items-center justify-center mr-2 shadow-neon-blue">
                      <span className="text-lg">🎓</span>
                    </div>
                  )}
                  <div className="flex flex-col max-w-[80%] group">
                    <div
                      className={`p-4 rounded-lg font-orbitron relative ${
                        message.role === 'user'
                          ? 'bg-neon-pink text-dark shadow-neon-pink'
                          : 'bg-neon-blue text-dark shadow-neon-blue'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        React.createElement(
                          ReactMarkdown as any,
                          {
                            components: {
                              code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline ? (
                                  <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match ? match[1] : undefined}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className="bg-gray-800 px-1 py-0.5 rounded text-neon-green" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              h1({children, ...props}: any) {
                                return <h1 className="text-2xl font-bold text-neon-pink mb-4" {...props}>{children}</h1>;
                              },
                              h2({children, ...props}: any) {
                                return <h2 className="text-xl font-bold text-neon-blue mb-3" {...props}>{children}</h2>;
                              },
                              h3({children, ...props}: any) {
                                return <h3 className="text-lg font-bold text-neon-green mb-2" {...props}>{children}</h3>;
                              },
                              blockquote({children, ...props}: any) {
                                return <blockquote className="border-l-4 border-neon-pink pl-4 italic text-gray-300" {...props}>{children}</blockquote>;
                              },
                              strong({children, ...props}: any) {
                                return <strong className="font-bold text-neon-pink" {...props}>{children}</strong>;
                              },
                              em({children, ...props}: any) {
                                return <em className="italic text-neon-blue" {...props}>{children}</em>;
                              },
                              ul({children, ...props}: any) {
                                return <ul className="list-disc ml-6 my-2" {...props}>{children}</ul>;
                              },
                              ol({children, ...props}: any) {
                                return <ol className="list-decimal ml-6 my-2" {...props}>{children}</ol>;
                              },
                              li({children, ...props}: any) {
                                return <li className="mb-1" {...props}>{children}</li>;
                              },
                              p({children, ...props}: any) {
                                return <p className="mb-2" {...props}>{children}</p>;
                              },
                              a({href, children, ...props}: any) {
                                return <a href={href} className="underline text-neon-pink hover:text-neon-blue" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                              },
                            }
                          },
                          message.content
                        )
                      ) : (
                        message.content
                      )}
                      {message.role === 'user' && message.status && (
                        <span className="absolute bottom-1 right-2 text-xs opacity-50">
                          {getStatusIcon(message.status)}
                        </span>
                      )}
                      <button
                        onClick={() => setShowReactionPicker(showReactionPicker === index ? null : index)}
                        className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-neon-blue hover:text-neon-pink"
                      >
                        😀
                      </button>
                    </div>
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {message.reactions.map((reaction, i) => (
                          <span
                            key={i}
                            className="bg-dark border border-neon-pink px-2 py-1 rounded-full text-xs"
                          >
                            {reaction.emoji} {reaction.count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reaction Picker Modal */}
      {showReactionPicker !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark p-4 rounded-lg border-2 border-neon-pink shadow-neon">
            <div className="flex gap-2">
              {EMOJI_REACTIONS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addReaction(showReactionPicker, emoji)}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat input area with file upload and RAG toggle */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mt-2">
        <div className="flex gap-2 items-end">
          <FileUpload
            onFilesUploaded={handleFilesUploaded}
            onRAGToggle={handleRAGToggle}
            hasFiles={hasFiles}
            ragEnabled={ragEnabled}
          />
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about your bootcamp materials..."
              className="w-full bg-dark border-2 border-neon-blue rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-neon-pink transition-colors"
              rows={1}
              disabled={isLoading}
            />
            {isTyping && (
              <div className="absolute bottom-2 right-2 text-neon-pink animate-pulse">
                <span className="text-sm">AI is typing...</span>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-neon-pink text-dark px-6 py-3 rounded-lg font-orbitron hover:bg-neon-pink/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-neon"
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
} 