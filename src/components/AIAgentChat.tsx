import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAgentChatProps {
  themeColor: string;
  state: {
    massKg: number;
    distanceMm: number;
    material: string;
    shape: string;
    forceN: number;
    requiredForceN: number;
  };
}

export default function AIAgentChat({ themeColor, state }: AIAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'أهلاً بك في المساعد الفيزيائي. كيف يمكنني مساعدتك في حساب القوى أو تحسين تجربة الرفع المغناطيسي اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          state
        })
      });

      const data = await response.json();
      if (response.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ أثناء الاتصال بالنموذج. يرجى التأكد من إعداد مفتاح API بشكل صحيح.' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'فشل الاتصال بالخادم.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] glass-panel border-white/10 rounded-2xl overflow-hidden shadow-xl" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/40 flex items-center gap-3">
        <Bot className="w-6 h-6" style={{ color: themeColor }} />
        <div>
          <h3 className="font-bold text-white">المساعد الذكي للفيزياء</h3>
          <p className="text-[10px] text-white/50 mono">Powered by LLaMA 3.3</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="flex-shrink-0 mt-1">
                {msg.role === 'user' ? 
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-white/70" />
                  </div>
                  :
                  <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center" style={{ borderColor: themeColor }}>
                    <Bot className="w-4 h-4" style={{ color: themeColor }} />
                  </div>
                }
              </div>
              <div 
                className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-white/10 text-white rounded-tr-none' 
                    : 'bg-black/60 text-white/90 border border-white/5 rounded-tl-none'
                }`}
              >
                <div className="markdown-body text-right">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
             <div className="flex gap-3 max-w-[85%] flex-row-reverse">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center" style={{ borderColor: themeColor }}>
                  <Bot className="w-4 h-4" style={{ color: themeColor }} />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-black/60 border border-white/5 rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white/50" />
                <span className="text-xs text-white/50">يحلل البيانات...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-black/40">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسألني عن حساب القوة، تأثير المادة، أو مسافة الرفع..."
            className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
            dir="rtl"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 transition-colors"
            style={{ color: themeColor }}
          >
            <Send className="w-4 h-4 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
