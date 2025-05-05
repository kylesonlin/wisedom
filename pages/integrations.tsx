import MainLayout from '../components/MainLayout';

export default function IntegrationsCenter() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Integrations Center</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LinkedIn Integration */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">LinkedIn</h2>
            <p className="text-gray-500 mb-4">Connect your LinkedIn account to sync your professional network and unlock deeper relationship insights.</p>
            <button className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800">Connect LinkedIn</button>
            <span className="mt-2 text-xs text-gray-400">Status: Not Connected</span>
          </div>
          {/* Google Calendar Integration */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Google Calendar</h2>
            <p className="text-gray-500 mb-4">Sync your meetings and events to link them with your contacts and action items.</p>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Connect Google Calendar</button>
            <span className="mt-2 text-xs text-gray-400">Status: Not Connected</span>
          </div>
          {/* Gmail Integration */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start">
            <h2 className="text-lg font-semibold mb-2">Gmail</h2>
            <p className="text-gray-500 mb-4">Analyze your email interactions for smarter follow-ups and relationship tracking.</p>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Connect Gmail</button>
            <span className="mt-2 text-xs text-gray-400">Status: Not Connected</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 