import { useState } from "react";
import { apiFetch } from "../api/client";
import { createDocument } from "../api/documents";
import { useAuth } from "../state/AuthContext";

const AIToolsPage = () => {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const { token } = useAuth();

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please paste some text to summarize.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<{ summary: string }>(
        "/summary",
        {
          method: "POST",
          body: JSON.stringify({ text: inputText }),
        }
      );
      setSummary(data.summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate summary.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToWorkspace = () => {
    if (!summary) {
      setError("Generate a summary before saving.");
      return;
    }
    setError(null);
    setSaving(true);
    setSaveStatus(null);
    createDocument(
      {
        title: `AI Summary - ${new Date().toLocaleDateString()}`,
        content: summary,
      },
      token,
    )
      .then(() => {
        setSaveStatus("Summary saved to DocSpace.");
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to save summary.";
        setError(message);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="form-row">
          <label className="field-label" htmlFor="ai-summary-input">Text to summarize</label>
          <textarea
            id="ai-summary-input"
            className="field-input"
            rows={8}
            placeholder="Paste your research paper text here..."
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
          />
        </div>
        <div className="tool-actions">
          <button type="button" className="primary-btn" onClick={handleGenerate}>
            {loading ? "Generating..." : "Generate AI Summary"}
          </button>
          <button type="button" className="success-btn" onClick={handleSaveToWorkspace} disabled={saving}>
            {saving ? "Saving..." : "Save to Workspace"}
          </button>
          <button type="button" className="secondary-btn" onClick={handleDownload}>
            Download Text
          </button>
        </div>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        {saveStatus && (
          <div className="hint-text">{saveStatus}</div>
        )}

        {summary && (
          <article className="summary-card">
            <h2>AI Summary</h2>
            <p>{summary}</p>
          </article>
        )}
      </section>
    </div>
  );
};

export default AIToolsPage;
