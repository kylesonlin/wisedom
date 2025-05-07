import { useEffect, useState } from 'react';
import { Card } from './ui/Card';

export function TestCookies() {
  const [cookiesEnabled, setCookiesEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    setCookiesEnabled(navigator.cookieEnabled);
  }, []);

  return (
    <Card className="p-4">
      <h3 className="font-medium mb-2">Cookie Status</h3>
      <div className="text-sm">
        {cookiesEnabled === null ? (
          <p>Checking cookie status...</p>
        ) : cookiesEnabled ? (
          <p className="text-green-600">Cookies are enabled</p>
        ) : (
          <p className="text-red-600">Cookies are disabled</p>
        )}
      </div>
    </Card>
  );
} 