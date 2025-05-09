'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';

export function SecurityDashboard() {
  const [securityStatus, setSecurityStatus] = useState({
    twoFactorEnabled: false,
    lastLogin: null,
    activeDevices: 0,
    securityEvents: [],
  });

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      const response = await fetch('/api/v1/security/status');
      const data = await response.json();
      setSecurityStatus(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch security status',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Security Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Two-Factor Authentication</h2>
          <div className="flex items-center justify-between">
            <Badge variant={securityStatus.twoFactorEnabled ? 'success' : 'warning'}>
              {securityStatus.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <Button onClick={() => window.location.href = '/settings/security/2fa'}>
              {securityStatus.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Active Sessions</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Last login: {securityStatus.lastLogin ? new Date(securityStatus.lastLogin).toLocaleString() : 'Never'}
            </p>
            <p className="text-sm text-gray-600">
              Active devices: {securityStatus.activeDevices}
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/settings/security/sessions'}>
              Manage Sessions
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Security Events</h2>
        <div className="space-y-4">
          {securityStatus.securityEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{event.type}</p>
                <p className="text-sm text-gray-600">{new Date(event.timestamp).toLocaleString()}</p>
              </div>
              <Badge variant={event.severity}>{event.severity}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 