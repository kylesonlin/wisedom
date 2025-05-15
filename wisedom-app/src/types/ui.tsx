import { ReactNode } from 'react';

export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

export interface InteractiveProps extends BaseProps {
  disabled?: boolean;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export interface StatusProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'default';
  message?: string;
}

export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
}

export interface ValidationProps {
  error?: string;
  warning?: string;
  success?: string;
}

export interface SizeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ColorProps {
  color?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'success' | 'error' | 'warning' | 'info';
}

export interface VariantProps {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
}

export interface IconProps {
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export interface TooltipProps {
  tooltip?: string;
  tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
}

export interface AriaProps {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  role?: string;
}

export interface AnimationProps {
  animate?: boolean;
  animationDuration?: number;
  animationDelay?: number;
}

export interface ResponsiveProps {
  responsive?: boolean;
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export interface ThemeProps {
  theme?: 'light' | 'dark' | 'system';
}

export interface CommonComponentProps extends
  BaseProps,
  InteractiveProps,
  StatusProps,
  LoadingProps,
  ValidationProps,
  SizeProps,
  ColorProps,
  VariantProps,
  IconProps,
  TooltipProps,
  AriaProps,
  AnimationProps,
  ResponsiveProps,
  ThemeProps {} 