import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "../styles/Project.css";

const AUTH_URL = import.meta.env.VITE_BACKEND_URL || "";
const API_URL = AUTH_URL.replace(/\/api\/auth\/?$/, "");

const PRESET_COLORS = ["#E8491C", "#3B82F6", "#22C55E", "#8B5CFF", "#EC4899", "#F5C518"];

export default function Project() {
  const { name } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState("#E8491C");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${API_URL}/api/projects/${name}`, { credentials: "include" });
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setProject(data);
        setColor(data.themeColor || "#E8491C");
      } catch (err) {
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [name]);

  const saveColor = async (newColor) => {
    setColor(newColor);
    try {
      const res = await fetch(`${API_URL}/api/projects/${name}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeColor: newColor }),
      });
      const data = await res.json();
      setProject(data);
    } catch (err) {
      console.error("Failed to save color:", err);
    }
  };

  const scriptTag = project
    ? `<script src="https://ashen-9949.onrender.com/widget.js" data-key="${project.widgetKey}"></script>`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return <div className="project-page"><div className="project-fallback">Loading…</div></div>;
  }

  if (!project) {
    return (
      <div className="project-page">
        <div className="project-fallback">
          <p>Project not found</p>
          <Link to="/dashboard">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="project-page">
      <header className="project-header">
        <Link to="/dashboard" className="back-link">← Dashboard</Link>
        <h1>{project.name}</h1>
      </header>

      <main className="project-main">
        <section className="panel">
          <h2>Embed script</h2>
          <p className="panel-sub">Paste this into your site's HTML.</p>
          <div className="script-row">
            <pre className="code-block"><code>{scriptTag}</code></pre>
            <button className="btn btn-ghost" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Widget color</h2>
          <p className="panel-sub">Shown in the chat bubble and accents.</p>
          <div className="color-hud">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`swatch ${color === c ? "active" : ""}`}
                style={{ background: c }}
                onClick={() => saveColor(c)}
                aria-label={c}
              />
            ))}
            <input
              type="color"
              className="swatch-custom"
              value={color}
              onChange={(e) => saveColor(e.target.value)}
            />
          </div>

          <div className="widget-preview">
            <div className="preview-bar">
              <span className="preview-dot" style={{ background: color }} />
              <span>{project.name}</span>
            </div>
            <div className="preview-body">
              <div className="preview-msg preview-msg-bot">Hi, how can I help?</div>
              <div className="preview-msg preview-msg-user" style={{ background: color }}>
                Do you ship internationally?
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
