export const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.png',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockWidgetPreferences = [
  {
    id: 'network',
    title: 'Network',
    enabled: true,
    order: 0,
    settings: {
      showConnections: true,
      showRecommendations: true,
    },
  },
  {
    id: 'projects',
    title: 'Projects',
    enabled: true,
    order: 1,
    settings: {
      showActive: true,
      showCompleted: false,
    },
  },
  {
    id: 'contacts',
    title: 'Contacts',
    enabled: true,
    order: 2,
    settings: {
      showRecent: true,
      showFavorites: true,
    },
  },
  {
    id: 'ai-insights',
    title: 'AI Insights',
    enabled: false,
    order: 3,
    settings: {
      showSuggestions: true,
      showTrends: true,
    },
  },
  {
    id: 'tasks',
    title: 'Tasks',
    enabled: false,
    order: 4,
    settings: {
      showPriority: true,
      showDueDate: true,
    },
  },
]; 