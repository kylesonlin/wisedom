import * as React from 'react';

export const Button = ({ children, ...props }: any) => (
  <button {...props}>{children}</button>
);

export const Input = ({ ...props }: any) => (
  <input {...props} />
);

export const Avatar = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const AvatarImage = ({ ...props }: any) => (
  <img {...props} />
);

export const AvatarFallback = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const DropdownMenu = ({ children }: any) => (
  <div data-testid="dropdown-menu">{children}</div>
);

export const DropdownMenuTrigger = ({ children, asChild }: any) => (
  <div data-testid="dropdown-trigger">{children}</div>
);

export const DropdownMenuContent = ({ children, ...props }: any) => (
  <div data-testid="dropdown-content" {...props}>{children}</div>
);

export const DropdownMenuItem = ({ children, onClick, ...props }: any) => (
  <div data-testid="dropdown-item" onClick={onClick} {...props}>{children}</div>
);

export const DropdownMenuLabel = ({ children, ...props }: any) => (
  <div data-testid="dropdown-label" {...props}>{children}</div>
);

export const DropdownMenuSeparator = () => (
  <hr data-testid="dropdown-separator" />
); 