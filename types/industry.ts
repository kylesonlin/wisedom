export interface IndustryUpdate {
  id: string;
  userId: string;
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: string;
  category: 'news' | 'trend' | 'analysis' | 'opportunity';
  relevance: 'high' | 'medium' | 'low';
  metadata: {
    author?: string;
    tags?: string[];
    summary?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
  createdAt: string;
  updatedAt: string;
} 