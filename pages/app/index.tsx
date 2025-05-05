import MainLayout from '../../components/MainLayout';

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1">
          {/* AI Action Suggestions Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">AI-Predicted Follow-Ups</h2>
            <div className="text-gray-500">[AIActionSuggestionsWidget placeholder]</div>
          </div>
          {/* Action Items Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Prioritized Action Items</h2>
            <div className="text-gray-500">[ActionItemsWidget placeholder]</div>
          </div>
        </div>
        <div className="col-span-1">
          {/* Birthdays Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Today's Birthdays</h2>
            <div className="text-gray-500">[BirthdaysWidget placeholder]</div>
          </div>
          {/* Relationship Strength Widget */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Relationship Strength Overview</h2>
            <div className="text-gray-500">[RelationshipStrengthWidget placeholder]</div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 