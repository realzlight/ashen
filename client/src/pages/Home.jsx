import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react"; // you missed this
import axios from "axios"; // you missed this
import "../styles/Home.css";

export default function Home() {
  const stepsRef = useRef(null);
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          withCredentials: true
        })
        setUser(res.data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkLogin()
  }, [])
  
  return (
    <div className="home">
      <nav className="nav">
        <span className="logo">
        
          Ashen
        </span>
        {loading ? null : user ? (
          <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>
        ) : (
          <Link to="/auth" className="btn btn-ghost">Sign in</Link>
        )}
      </nav>
      
      

      
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>The embers<br />never die down.</h1>
            <p>
              Ashen reads your docs once, then answers on its own — no
              scripted flows, no canned replies.
            </p>
            <div className="hero-actions">
          {loading ? null : user ? (
  <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
) : (
  <Link to="/auth" className="btn btn-primary">Get Started</Link>
)}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => stepsRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                See how it works
              </button>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="widget-mock">
              <div className="widget-bar">
                <span className="widget-dot" />
                <span>Ashen</span>
              </div>
              <div className="widget-body">
                <div className="msg msg-user">Do you work with Shopify?</div>
                <div className="msg msg-bot">
                  Yes — install takes under five minutes. Want the setup steps?
                </div>
              </div>
              <div className="widget-input">Ask a question…</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-head">
          <span className="section-index">01</span>
          <h2>What it actually does</h2>
        </div>
        <div className="feature-row">
          <h3>Trained on what you already have</h3>
          <p>Point it at your docs, help center, or FAQ pages — no separate content to maintain.</p>
        </div>
        <div className="feature-row">
          <h3>One script tag</h3>
          <p>Paste one line into your HTML. No SDK, no rebuild, no backend work.</p>
        </div>
        <div className="feature-row">
          <h3>Hands off when it's not sure</h3>
          <p>Below a confidence threshold, it stops guessing and routes to a human with the full conversation attached.</p>
        </div>
      </section>

      <section className="steps" ref={stepsRef}>
        <div className="section-head">
          <span className="section-index">02</span>
          <h2>How it works</h2>
        </div>
        <div className="step">
          <span className="step-num">01</span>
          <div>
            <h3>Connect your content</h3>
            <p>Point Ashen at your docs, help center, or FAQ pages.</p>
          </div>
        </div>
        <div className="step">
          <span className="step-num">02</span>
          <div>
            <h3>Add one script tag</h3>
            <p>Paste a single line into your site's HTML — no build step.</p>
          </div>
        </div>
        <div className="step">
          <span className="step-num">03</span>
          <div>
            <h3>It starts answering</h3>
            <p>Visitors get instant answers, day or night, in your product's voice.</p>
          </div>
        </div>
      </section>

      <section className="embed">
        <div className="section-head">
          <span className="section-index">03</span>
          <h2>Ship it in one line</h2>
        </div>
        <div className="embed-row">
          <p>Paste this into your site's HTML. No SDK, no build step, no backend changes.</p>
          <pre className="code-block">
            <code>{`<script src="https://ashen.ai/widget.js" data-key="YOUR_KEY"></script>`}</code>
          </pre>
        </div>
      </section>

      <section className="faq">
        <div className="section-head">
          <span className="section-index">04</span>
          <h2>Common questions</h2>
        </div>
        <div className="faq-item">
          <h3>Does it use our content to train other customers' bots?</h3>
          <p>No — each workspace's content stays isolated to that workspace.</p>
        </div>
        <div className="faq-item">
          <h3>What happens when it doesn't know the answer?</h3>
          <p>It hands off to a human instead of guessing.</p>
        </div>
        <div className="faq-item">
          <h3>How long does setup take?</h3>
          <p>Minutes — no backend changes required on your end.</p>
        </div>
      </section>

      <section className="closing">
        <p>Most teams are live in under ten minutes.</p>
        <Link to="/auth" className="btn btn-primary">Get started</Link>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Ashen</span>
        <Link to="/auth">Sign in</Link>
      </footer>
    </div>
  );
}
