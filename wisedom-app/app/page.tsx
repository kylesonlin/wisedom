export default function Home() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Sidebar (static placeholder) */}
      <aside style={{ width: 220, background: '#222', color: '#fff', padding: 24 }}>
        <h2>Sidebar</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>Dashboard</li>
          <li>Contacts</li>
          <li>Tasks</li>
          <li>Settings</li>
        </ul>
      </aside>
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header (static placeholder) */}
        <header style={{ height: 64, background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>Dashboard Header</h1>
        </header>
        {/* Main area */}
        <main style={{ flex: 1, padding: 32 }}>
          <p>Main dashboard content goes here (placeholder).</p>
        </main>
      </div>
    </div>
  );
}
