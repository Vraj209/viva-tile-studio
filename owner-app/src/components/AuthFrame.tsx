export default function AuthFrame({ title, description, children }: {
  title: string; description: string; children: React.ReactNode;
}) {
  return <main id="main" className="auth-layout">
    <aside className="auth-panel">
      <div className="auth-brand">VAVI<span>TILE STUDIO</span></div>
      <div className="auth-copy"><p className="eyebrow">THE OWNER WORKSPACE</p>
        <h2>Every great space<br />starts with a conversation.</h2>
        <p>Keep every project inquiry, idea, and inspiration together. Your next conversation starts here.</p>
      </div>
      <p className="auth-footer">A private space for the VAVI team.</p>
    </aside>
    <section className="auth-card" aria-labelledby="auth-title">
      <p className="eyebrow">VAVI OWNER</p><h1 id="auth-title">{title}</h1><p className="muted">{description}</p>
      {children}
    </section>
  </main>;
}
