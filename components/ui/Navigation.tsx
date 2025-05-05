import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { Card } from './Card';
import { ChevronDown, Menu } from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  children?: NavigationItem[];
}

interface NavigationProps {
  items: NavigationItem[];
  activePath?: string;
  className?: string;
  isMobile?: boolean;
}

export function Navigation({ items, activePath, className, isMobile }: NavigationProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const renderItem = (item: NavigationItem, level = 0) => {
    const isActive = activePath === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);

    return (
      <li key={item.href} className={cn(level > 0 && 'ml-4')}>
        <div className="relative">
          <Button
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start transition-colors',
              isActive && 'bg-secondary/80',
              level > 0 && 'text-sm'
            )}
            onClick={() => hasChildren && toggleItem(item.href)}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <ChevronDown
                className={cn(
                  'ml-2 h-4 w-4 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            )}
          </Button>
          {hasChildren && (
            <ul
              className={cn(
                'overflow-hidden transition-all duration-200',
                isExpanded ? 'max-h-full' : 'max-h-0'
              )}
            >
              {item.children?.map(child => renderItem(child, level + 1))}
            </ul>
          )}
        </div>
      </li>
    );
  };

  return (
    <nav className={cn('w-full', className)}>
      <ul className={cn('flex', isMobile ? 'flex-col space-y-1' : 'flex-row space-x-1')}>
        {items.map(item => renderItem(item))}
      </ul>
    </nav>
  );
}

interface SidebarProps extends NavigationProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ header, footer, items, activePath, className, isOpen = true, onClose }: SidebarProps) {
  return (
    <Card
      className={cn(
        'h-full w-64 p-4 transition-all duration-300',
        !isOpen && 'hidden',
        className
      )}
    >
      {header && <div className="mb-4">{header}</div>}
      <Navigation items={items} activePath={activePath} />
      {footer && <div className="mt-4">{footer}</div>}
    </Card>
  );
}

interface TopNavProps extends NavigationProps {
  logo?: React.ReactNode;
  rightContent?: React.ReactNode;
  onMenuClick?: () => void;
}

export function TopNav({ logo, rightContent, items, activePath, className, onMenuClick }: TopNavProps) {
  return (
    <Card className={cn('w-full p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
            </Button>
          )}
          {logo && <div className="mr-4">{logo}</div>}
          <Navigation items={items} activePath={activePath} />
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </Card>
  );
} 