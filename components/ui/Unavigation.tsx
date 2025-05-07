import React, { useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { cn } from '../../utils/cn';
import { Button } from './Ubutton';
import { Card } from './Ucard';
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
      <NavigationMenu.Item key={item.href}>
        <NavigationMenu.Trigger
          className={cn(
            'group inline-flex w-full items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
            isActive && 'bg-accent text-accent-foreground',
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
                'ml-2 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180',
                isExpanded && 'rotate-180'
              )}
              aria-hidden="true"
            />
          )}
        </NavigationMenu.Trigger>
        {hasChildren && (
          <NavigationMenu.Content
            className={cn(
              'overflow-hidden transition-all duration-200',
              isExpanded ? 'max-h-full' : 'max-h-0'
            )}
          >
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {item.children?.map(child => (
                <li key={child.href}>
                  <NavigationMenu.Link asChild>
                    <a
                      href={child.href}
                      className={cn(
                        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                        activePath === child.href && 'bg-accent text-accent-foreground'
                      )}
                    >
                      {child.icon && <span className="mr-2">{child.icon}</span>}
                      <div className="text-sm font-medium leading-none">{child.label}</div>
                      {child.badge && (
                        <span className="mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {child.badge}
                        </span>
                      )}
                    </a>
                  </NavigationMenu.Link>
                </li>
              ))}
            </ul>
          </NavigationMenu.Content>
        )}
      </NavigationMenu.Item>
    );
  };

  return (
    <NavigationMenu.Root className={cn('w-full', className)}>
      <NavigationMenu.List className={cn('flex', isMobile ? 'flex-col space-y-1' : 'flex-row space-x-1')}>
        {items.map(item => renderItem(item))}
      </NavigationMenu.List>
      <NavigationMenu.Viewport className="relative mt-2 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90" />
    </NavigationMenu.Root>
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
              <span className="sr-only">Toggle menu</span>
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