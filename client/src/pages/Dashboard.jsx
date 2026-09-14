
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Globe, MoreHorizontal, Search } from "lucide-react";
import "../styles/Dashboard.css";

const AUTH_URL = import.meta.env.VITE_BACKEND_URL || ""; // already includes /api/auth
const API_URL = AUTH_URL.replace(/\/api\/auth\/?$/, ""); // bare host, for /api/projects

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    geminiApiKey: "",
    businessInfo: "",
    websiteUrl: "",
    docs: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const res = await fetch(`${API_URL}/api/projects`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${AUTH_URL}/logout`, { credentials: "include" });
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      setProjectsLoading(true);
      const res = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.msg || "Failed to create project");
        return;
      }
      setShowModal(false);
      setForm({ name: "", geminiApiKey: "", businessInfo: "", websiteUrl: "", docs: "" });
      await fetchProjects();
    } catch (err) {
      console.error("Create project failed:", err);
      alert("Something went wrong");
    } finally {
      setProjectsLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="dash-left">
            <span className="dash-logo">
              <span className="logo-mark" aria-hidden="true" />
              Ashen
            </span>
            <nav className="dash-nav">
              <span className="dash-nav-item active">Overview</span>
              <span className="dash-nav-item">Projects</span>
              <span className="dash-nav-item">Integrations</span>
              <span className="dash-nav-item">Settings</span>
            </nav>
          </div>

          <div className="dash-right">
            <div className="search-box">
              <Search className="search-icon" size={14} />
              <input className="search-input" placeholder="Search…" />
            </div>
            <button className="btn-logout" onClick={handleLogout}>Log out</button>
          </div>
        </div>
      </header>

      <main className="dash-main">
        <div className="dash-heading-row">
          <div>
            <h1>Projects</h1>
            <p>Manage your AI assistants.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> New project
          </button>
        </div>

        {projectsLoading && projects.length === 0 ? (
          <div className="dash-loading">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="projects-empty">
            <div className="empty-icon"><Plus size={16} /></div>
            <p className="empty-title">No projects yet</p>
            <p className="empty-sub">Create your first AI assistant.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create project</button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <Link key={project._id} to={`/dashboard/${project.name}`} className="project-card">
                <div className="project-card-top">
                  <div className="project-avatar">{project.name?.[0]?.toUpperCase() || "?"}</div>
                  <MoreHorizontal size={14} className="project-more" />
                </div>
                <h3>{project.name}</h3>
                <p className="project-domain">
                  <Globe size={12} /> {project.websiteUrl || "No domain"}
                </p>
                <div className="project-status">
                  <span className="status-dot" />
                  <span>Ready</span>
                  <span className="project-date">
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-panel">
            <div className="modal-header">
              <h2>New project</h2>
              <p>Create a new AI assistant for your website.</p>
            </div>
            <form className="modal-form" onSubmit={createProject}>
              <div className="form-group">
                <label>Project name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="my-awesome-store"
                />
              </div>
              <div className="form-group">
                <label>Gemini API key *</label>
                <input
                  required
                  type="password"
                  value={form.geminiApiKey}
                  onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value })}
                  placeholder="AIza…"
                />
              </div>
              <div className="form-group">
                <label>Website URL</label>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="form-group">
                <label>Business / product info</label>
                <textarea
                  rows={3}
                  value={form.businessInfo}
                  onChange={(e) => setForm({ ...form, businessInfo: e.target.value })}
                  placeholder="What does your business do?"
                />
              </div>
              <div className="form-group">
                <label>Knowledge base / docs</label>
                <textarea
                  rows={5}
                  value={form.docs}
                  onChange={(e) => setForm({ ...form, docs: e.target.value })}
                  placeholder="Paste FAQs, product details, policies…"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={projectsLoading}>
                  {projectsLoading ? "Creating…" : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
