import React from 'react';

// Mock Button component
export const Button = ({ children, ...props }: any) => (
  <button {...props}>{children}</button>
);

// Mock Input component
export const Input = ({ ...props }: any) => (
  <input {...props} />
);

// Mock Select component
export const Select = ({ children, ...props }: any) => (
  <select {...props}>{children}</select>
);

// Mock Sheet components
export const Sheet = ({ children }: any) => <div>{children}</div>;
export const SheetTrigger = ({ children }: any) => <div>{children}</div>;
export const SheetContent = ({ children }: any) => <div>{children}</div>;
export const SheetHeader = ({ children }: any) => <div>{children}</div>;
export const SheetFooter = ({ children }: any) => <div>{children}</div>;
export const SheetTitle = ({ children }: any) => <div>{children}</div>;
export const SheetDescription = ({ children }: any) => <div>{children}</div>;

// Mock Dialog components
export const Dialog = ({ children }: any) => <div>{children}</div>;
export const DialogTrigger = ({ children }: any) => <div>{children}</div>;
export const DialogContent = ({ children }: any) => <div>{children}</div>;
export const DialogHeader = ({ children }: any) => <div>{children}</div>;
export const DialogFooter = ({ children }: any) => <div>{children}</div>;
export const DialogTitle = ({ children }: any) => <div>{children}</div>;
export const DialogDescription = ({ children }: any) => <div>{children}</div>;

// Mock Toast components
export const Toast = ({ children }: any) => <div>{children}</div>;
export const ToastProvider = ({ children }: any) => <div>{children}</div>;
export const ToastViewport = ({ children }: any) => <div>{children}</div>;
export const ToastTitle = ({ children }: any) => <div>{children}</div>;
export const ToastDescription = ({ children }: any) => <div>{children}</div>;
export const ToastAction = ({ children }: any) => <div>{children}</div>;
export const ToastClose = ({ children }: any) => <div>{children}</div>; 