import { useState } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../state/AuthContext';

const demoCreds = {
  email: 'demo@researchhub.ai',
  password: 'sonika123',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { setToken, setUserEmail } = useAuth();
  const [email, setEmail] = useState(demoCreds.email);
  const [password, setPassword] = useState(demoCreds.password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      setToken(res.access_token);
      setUserEmail(email);
      navigate('/home');
      return;
    } catch {
      if (email === demoCreds.email && password === demoCreds.password) {
        setToken('demo-session-token');
        setUserEmail(email);
        navigate('/home');
        return;
      }
      setError('Login failed. Use demo@researchhub.ai / password123 for demo mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="planet-glow" />
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p>Sign in to continue to ResearchHub AI</p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={onSubmit} className="login-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
