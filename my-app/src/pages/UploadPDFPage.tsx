import { useState } from 'react';
import type React from 'react';
import { uploadPdf } from '../api/papers';
import { useAuth } from '../state/AuthContext';

const UploadPDFPage = () => {
  const [filename, setFilename] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFilename(file?.name ?? null);
    if (!file) return;

    setUploading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await uploadPdf(file, token);
      setMessage(`Uploaded "${res.title}" successfully.`);
    } catch (err) {
      console.error(err);
      setError('Failed to upload PDF.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <h1>Upload PDF</h1>
        <p className="subtitle">Drag-and-drop papers into your workspace library</p>

        <label className="upload-box">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleChange}
          />
          <div className="upload-inner">
            <strong>{uploading ? 'Uploading...' : 'Drop PDF files here'}</strong>
            <span>or click to browse</span>
          </div>
        </label>

        {filename && <div className="hint-text">Selected: {filename}</div>}
        {message && <div className="hint-text">{message}</div>}
        {error && <div className="form-error" role="alert">{error}</div>}
      </section>
    </div>
  );
};

export default UploadPDFPage;
