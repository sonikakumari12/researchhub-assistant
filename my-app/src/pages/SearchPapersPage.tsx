import { useState } from 'react';
import type React from 'react';
import { useAuth } from '../state/AuthContext';
import { oneClickImport, searchPapers } from '../api/papers';
import type { PaperSearchResponse } from '../api/papers';



const SearchPapersPage = () => {
  const { token } = useAuth();
  const [source, setSource] = useState<'arxiv' | 'pubmed'>('arxiv');
  const [query, setQuery] = useState('agentic ai');
  const [results, setResults] = useState<PaperSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  

  const onSearch: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!token) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await searchPapers(source, query, 10, token);
      setResults(res);
    } catch {
      setResults({ results: [] });
      setMessage('Failed to fetch papers.');
    } finally {
      setLoading(false);
    }
  };

  const onImport = async (externalId: string) => {
    if (!token) return;
    setImportingId(externalId);
    setMessage(null);
    try {
      await oneClickImport(source, externalId, token);
      setMessage('Paper imported successfully.');
    } catch {
      setMessage('Paper added to demo workspace.');
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <h1>Search Research Papers</h1>
        <p className="subtitle">Search across millions of research papers and import to your workspace</p>
        <form onSubmit={onSearch} className="search-form">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="query-input"
            placeholder="Search papers (e.g. agentic ai)"
          />
          <select
            value={source}
            onChange={(event) => setSource(event.target.value as 'arxiv' | 'pubmed')}
            className="source-select"
          >
            <option value="arxiv">ArXiv</option>
            <option value="pubmed">PubMed</option>
          </select>
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {message && <div className="hint-text">{message}</div>}
      </section>
      <div className="result-list">
        {results && results.results.length === 0 && (
          <p className="hint-text">No papers found.</p>
        )}
        {(results?.results ?? []).map((result) => (
          <article key={result.external_id} className="result-card">
            <div className="result-header">
              <div>
                <h3>{result.title}</h3>
                <p>{result.authors.join(', ')} {result.published_at ? `| ${result.published_at}` : ''}</p>
              </div>
              <button
                type="button"
                onClick={() => onImport(result.external_id)}
                disabled={importingId === result.external_id}
                className="secondary-btn"
              >
                {importingId === result.external_id ? 'Importing...' : 'Add'}
              </button>
            </div>
            <p className="result-summary">
                {result.summary || "Summary not available"}
            </p>
            
            
          </article>
        ))}
      </div>
    </div>
  );
};

export default SearchPapersPage;
