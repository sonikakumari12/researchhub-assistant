import { useNavigate } from 'react-router-dom';

const featureCards = [
  { title: 'Smart Paper Search', desc: 'Find papers quickly with keyword and source filters.' },
  { title: 'AI Chat Assistant', desc: 'Ask paper questions and get research-ready answers.' },
  { title: 'DocSpace Editor', desc: 'Write notes and save reports inside your workspace.' },
  { title: 'Literature Review', desc: 'Build summaries from multiple papers in seconds.' },
];

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-stack">
      <section className="hero-card">
        <h1>Your AI-Powered Research Assistant</h1>
        <p>
          Accelerate your research with intelligent paper discovery, AI-powered insights,
          and collaborative document management in one platform.
        </p>
        <div className="hero-actions">
          <button type="button" className="primary-btn" onClick={() => navigate('/search')}>
            Start Researching
          </button>
          <button type="button" className="ghost-btn" onClick={() => navigate('/docspace')}>
            Try DocSpace
          </button>
        </div>
      </section>

      <section className="panel">
        <h2>Powerful Features for Modern Research</h2>
        <div className="feature-grid">
          {featureCards.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="why-card">
        <h2>Why Choose ResearchHub AI?</h2>
        <p>Save 80% time on literature review with AI-grounded summaries and collaboration tools.</p>
      </section>
    </div>
  );
};

export default HomePage;
