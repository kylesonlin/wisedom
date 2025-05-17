import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "./components/DashboardHeader";

export default function Home() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 220, background: '#f4f4f4', padding: 16 }}>
        <DashboardSidebar />
      </aside>
      <main style={{ flex: 1 }}>
        <DashboardHeader 
          onToggleWidget={() => {}} 
          visibleWidgets={{}} 
          onOpenFeedback={() => {}} 
        />
        <section style={{ padding: 24 }}>
          Hello World
        </section>
      </main>
    </div>
  );
}
