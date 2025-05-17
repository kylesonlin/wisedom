export default function Home() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#f4f4f4', padding: 16 }}>
        <div style={{ fontWeight: 'bold', marginBottom: 24 }}>Sidebar</div>
        {/* Sidebar placeholder */}
      </aside>
      <main style={{ flex: 1 }}>
        <header style={{ background: '#fff', borderBottom: '1px solid #eee', padding: 16, fontWeight: 'bold' }}>
          Header
        </header>
        <section style={{ padding: 24 }}>
          Hello World
        </section>
      </main>
    </div>
  );
}
