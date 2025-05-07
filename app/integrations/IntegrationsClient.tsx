"use client";
import MainLayout from '@/components/MainLayout';

export default function IntegrationsClient() {
  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Integrations</h1>
        <p className="text-gray-600 mb-8">Connect your favorite tools and services to enhance your workflow.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Integration Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Google Calendar</h2>
            <p className="text-gray-600 mb-4">Sync your calendar events and meetings.</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Connect</button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Slack</h2>
            <p className="text-gray-600 mb-4">Get notifications and updates in your Slack channels.</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Connect</button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Zoom</h2>
            <p className="text-gray-600 mb-4">Schedule and manage video meetings.</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Connect</button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 