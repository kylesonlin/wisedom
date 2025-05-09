import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Widget {
  id: string;
  type: 'activity' | 'task' | 'contact' | 'project';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
}

interface DashboardState {
  widgets: Widget[];
  layout: 'grid' | 'free';
  addWidget: (widget: Omit<Widget, 'id'>) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  updateLayout: (layout: 'grid' | 'free') => void;
  reorderWidgets: (widgets: Widget[]) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: [],
      layout: 'grid',
      addWidget: (widget) =>
        set((state) => ({
          widgets: [
            ...state.widgets,
            { ...widget, id: Math.random().toString(36).substr(2, 9) },
          ],
        })),
      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        })),
      updateWidget: (id, updates) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),
      updateLayout: (layout) => set({ layout }),
      reorderWidgets: (widgets) => set({ widgets }),
    }),
    {
      name: 'dashboard-storage',
    }
  )
); 