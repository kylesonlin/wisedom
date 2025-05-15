import { ComponentType } from 'react';

// Base widget props interface
export interface BaseWidgetProps {
  id: string;
  settings?: WidgetSettings;
}

// Widget settings interface
export interface WidgetSettings {
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  refreshInterval?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  customStyles?: Record<string, string>;
  [key: string]: unknown;
}

// Widget component type
export type WidgetComponent = ComponentType<BaseWidgetProps>;

// Widget type
export interface Widget {
  id: string;
  title: string;
  component: WidgetComponent;
  enabled: boolean;
  order: number;
  settings?: WidgetSettings;
  type: 'contact-card' | 'network-overview' | 'relationship-strength' | 'action-items' | 'ai-suggestions';
  description?: string;
  category?: 'analytics' | 'contacts' | 'tasks' | 'ai' | 'other';
  permissions?: Array<'read' | 'write' | 'delete'>;
  version?: string;
  lastUpdated?: Date;
} 