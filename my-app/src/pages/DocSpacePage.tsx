import { useEffect, useState } from 'react';
import { createDocument, getDocuments, updateDocument, type Document } from '../api/documents';
import { useAuth } from '../state/AuthContext';

const DocSpacePage = () => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getDocuments(token)
      .then((data) => {
        if (!isMounted) return;
        setDocuments(data);
        if (data.length > 0) {
          setActiveId(data[0].id);
          setTitle(data[0].title);
          setContent(data[0].content);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (!isMounted) return;
        setError('Failed to load documents.');
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [token]);

  const selectDocument = (doc: Document) => {
    setActiveId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
  };

  const handleNewDocument = () => {
    setActiveId(null);
    setTitle('');
    setContent('');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Document title is required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (activeId) {
        const updated = await updateDocument(
          activeId,
          { title: title.trim(), content },
          token,
        );
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === updated.id ? updated : doc)),
        );
      } else {
        const created = await createDocument(
          { title: title.trim(), content },
          token,
        );
        setDocuments((prev) => [created, ...prev]);
        setActiveId(created.id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save document.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="docspace-layout">
      <aside className="doc-list">
        <button type="button" className="primary-btn full" onClick={handleNewDocument}>
          + New Document
        </button>
        <ul>
          {loading && <li>Loading...</li>}
          {!loading && documents.length === 0 && <li>No documents yet</li>}
          {documents.map((doc) => (
            <li
              key={doc.id}
              className={doc.id === activeId ? 'active' : ''}
              onClick={() => selectDocument(doc)}
            >
              {doc.title}
            </li>
          ))}
        </ul>
      </aside>

      <section className="doc-editor">
        <div className="doc-header">
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
          <div className="doc-actions">
            <button type="button" className="primary-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="secondary-btn" onClick={handleDownload}>
              Download
            </button>
          </div>
        </div>
        <div className="toolbar">H B I U | list | quote</div>
        <textarea value={content} onChange={(event) => setContent(event.target.value)} />
        {error && <div className="form-error" role="alert">{error}</div>}
      </section>
    </div>
  );
};

export default DocSpacePage;
