"use client";

import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import { CarbonProfile, FootprintBreakdown } from '@/lib/types';
import { askSustainabilityCoach, ChatMessage } from '@/lib/geminiService';

interface AICoachChatProps {
  profile: CarbonProfile;
  breakdown: FootprintBreakdown;
  riskScore: number;
}

const STARTER_QUESTIONS = [
  "How can I reduce my footprint fastest?",
  "Is flying really that bad?",
  "What's my biggest impact area?",
  "Give me a 30-day plan"
];

export default function AICoachChat({ profile, breakdown, riskScore }: AICoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: `Hi! I'm your EcoSphere Coach. Your total footprint is **${breakdown.total} kg CO2e/year**. What would you like to know about reducing your impact?`,
    timestamp: new Date()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Exclude the newest user message from history, pass it separately
      const history = messages.slice(-10); // Keep context window reasonable
      const responseText = await askSustainabilityCoach(userMsg.content, profile, breakdown, riskScore, history);
      
      const assistantMsg: ChatMessage = { 
        role: 'assistant', 
        content: responseText, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const createMarkup = (html: string) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-xl shadow-inner border border-emerald-500/30">
          🌍
        </div>
        <div>
          <h2 className="font-bold text-slate-100">EcoSphere Coach</h2>
          <p className="text-xs text-emerald-400">Powered by Gemini AI</p>
        </div>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
        aria-live="polite"
        role="log"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                  🤖
                </div>
              )}
              <div 
                className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-sm' 
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
                }`}
                dangerouslySetInnerHTML={createMarkup(msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
              🤖
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {STARTER_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-emerald-900/50 border border-slate-700 hover:border-emerald-500/50 rounded-full text-emerald-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            placeholder="Ask about your carbon footprint..."
            aria-label="Ask your sustainability coach a question"
            className="flex-1 bg-slate-800 text-slate-100 rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isTyping || !inputValue.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {isTyping ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
