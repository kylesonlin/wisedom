import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
}

export default function PageContainer({ children, title }: PageContainerProps) {
  return (
    <div className="space-y-6">
      {title && (
        <div className="border-b border-gray-200 pb-5">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {title}
          </h2>
        </div>
      )}
      {children}
    </div>
  );
} 