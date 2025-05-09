import { Card } from '@/components/ui/Card';

export default function RelationshipStrength() {
  const metrics = [
    { label: 'Professional', value: 85 },
    { label: 'Personal', value: 60 },
    { label: 'Trust', value: 75 },
  ];

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Relationship Strength</h3>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">{metric.label}</span>
              <span className="text-sm">{metric.value}%</span>
            </div>
            <div
              role="progressbar"
              className="bg-gray-200 rounded-full h-2"
              aria-valuenow={metric.value}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 