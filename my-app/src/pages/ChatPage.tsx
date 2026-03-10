import { useState } from 'react';
import type React from 'react';
import { chat } from '../api/chat';
import { useAuth } from '../state/AuthContext';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const ChatPage = () => {
  const { token } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!input.trim() || !token) return;
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await chat(userMessage.content, token);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.response },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || 'Error contacting AI.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-3rem)]">
      <h1 className="text-2xl font-semibold text-sky-400 mb-4">
        AI Research Assistant
      </h1>
      <div className="flex-1 border border-slate-800 rounded-lg bg-slate-900/60 p-3 overflow-y-auto space-y-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`px-3 py-2 rounded-md max-w-xl text-sm ${
              m.role === 'user'
                ? 'bg-sky-600/80 ml-auto text-white'
                : 'bg-slate-800 text-slate-100'
            }`}
          >
            {m.content}
          </div>
        ))}
        {!messages.length && (
          <p className="text-sm text-slate-500">
            Ask a question about your imported papers, for example:
            {' '}
            &quot;Summarize the main findings across my transformer papers.&quot;
          </p>
        )}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm"
          placeholder="Ask a research question..."
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-md bg-sky-500 hover:bg-sky-600 text-sm font-medium disabled:opacity-60"
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatPage;