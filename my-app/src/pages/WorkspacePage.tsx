import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { chat } from '../api/chat';
import { getWorkspace } from '../api/workspaces';
import { useAuth } from '../state/AuthContext';

type Message = {
  role: 'user' | 'assistant';
  text: string;
};

const WorkspacePage = () => {
  const { workspaceId } = useParams();
  const { token } = useAuth();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'The paper reveals responsible AI agents with practical applications in advanced research workflows.',
    },
  ]);

  useEffect(() => {
    if (!workspaceId) return;
    const id = Number(workspaceId);
    if (Number.isNaN(id)) return;
    getWorkspace(id, token)
      .then((data) => setWorkspaceName(data.name))
      .catch(() => setWorkspaceName(null));
  }, [workspaceId, token]);

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="workspace-toolbar">
          <span>papers (0)</span>
          <span>AI chat</span>
          <span>{workspaceName ?? 'Workspace'}</span>
        </div>

        <div className="chat-shell">
          <div className="chat-title">AI Research Assistant</div>
          <div className="chat-body">
            {messages.map((message, index) => (
              <div key={index} className={`bubble ${message.role}`}>
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="bubble assistant">
                Thinking...
              </div>
            )}
          </div>

          <form
            className="chat-input-row"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!input.trim()) return;
              setError(null);
              const message = input.trim();
              setMessages((prev) => [...prev, { role: 'user', text: message }]);
              setInput('');
              setLoading(true);
              try {
                const res = await chat(message, token);
                setMessages((prev) => [...prev, { role: 'assistant', text: res.response }]);
              } catch (err) {
                console.error(err);
                setError('Failed to reach the AI assistant.');
              } finally {
                setLoading(false);
              }
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about the selected papers..."
            />
            <button type="submit" className="primary-btn">Send</button>
          </form>
          {error && <div className="form-error" role="alert">{error}</div>}
        </div>
      </section>
    </div>
  );
};

export default WorkspacePage;
