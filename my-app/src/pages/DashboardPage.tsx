import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkspace, getWorkspaces, type Workspace } from "../api/workspaces";
import { useAuth } from "../state/AuthContext";

const DashboardPage = () => {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    getWorkspaces(token)
      .then((data) => {
        if (!isMounted) return;
        setWorkspaces(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching workspaces:", err);
        if (!isMounted) return;
        setError("Failed to load workspaces.");
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Workspace name is required.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const created = await createWorkspace(name.trim(), description.trim() || null, token);
      setWorkspaces((prev) => [created, ...prev]);
      setName("");
      setDescription("");
      setShowCreate(false);
      navigate(`/workspace/${created.id}`);
    } catch (err) {
      console.error("Error creating workspace:", err);
      setError("Failed to create workspace.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <h1>Dashboard</h1>
        <p className="subtitle">Manage your research workspaces</p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Workspaces</div>
            <div className="stat-value">{workspaces.length}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Papers Imported</div>
            <div className="stat-value">
              {workspaces.reduce((total, ws) => total + (ws.papers ?? 0), 0)}
            </div>
          </div>

          <div
            className="stat-card link-card"
            onClick={() => navigate("/search")}
          >
            <div className="stat-label">Quick Actions</div>
            <div className="stat-value-sm">Search Papers</div>
          </div>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={() => setShowCreate((prev) => !prev)}
        >
          {showCreate ? "Close Workspace Form" : "+ Create New Workspace"}
        </button>

        {showCreate && (
          <div className="panel" style={{ marginTop: "1rem" }}>
            <div className="form-row">
              <label className="field-label" htmlFor="workspace-name">Workspace name</label>
              <input
                id="workspace-name"
                className="field-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Transformer Survey"
              />
            </div>
            <div className="form-row">
              <label className="field-label" htmlFor="workspace-description">Description</label>
              <textarea
                id="workspace-description"
                className="field-input"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional notes about this workspace"
              />
            </div>
            <div className="tool-actions">
              <button
                type="button"
                className="primary-btn"
                disabled={creating}
                onClick={handleCreate}
              >
                {creating ? "Creating..." : "Create Workspace"}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setShowCreate(false);
                  setName("");
                  setDescription("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && <div className="hint-text">{error}</div>}
      </section>

      {/* Workspace cards */}
      <section className="workspace-grid">
        {loading ? (
          <p>Loading workspaces...</p>
        ) : workspaces.length === 0 ? (
          <p>No workspaces yet</p>
        ) : (
          workspaces.map((item) => (
            <article
              key={item.id}
              className="workspace-card"
              onClick={() => navigate(`/workspace/${item.id}`)}
            >
              <div className="workspace-top">
                <h3>{item.name}</h3>
                <span>{item.papers || 0} papers</span>
              </div>

              <p>{item.description || "No description"}</p>

              <small>
                Created {item.createdAt ? item.createdAt : "Recently"}
              </small>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
