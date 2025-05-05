import React from 'react';
import { PriorityScore } from '../utils/contactPrioritization';
import { InteractionAnalysis } from '../utils/aiAnalysis';

interface PriorityVisualizationProps {
  priorityScore: PriorityScore;
  interactionAnalysis?: InteractionAnalysis;
  trends?: {
    relationshipTrend: number[];
    topicEvolution: Record<string, number[]>;
    sentimentTrend: number[];
  };
}

export default function PriorityVisualization({
  priorityScore,
  interactionAnalysis,
  trends
}: PriorityVisualizationProps) {
  return (
    <div className="space-y-6">
      {/* Priority Score Radar Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Priority Score Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(priorityScore).map(([factor, score]) => (
            <div key={factor} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {factor.charAt(0).toUpperCase() + factor.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(score * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    score > 0.7
                      ? 'bg-green-500'
                      : score > 0.4
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relationship Strength and Sentiment */}
      {interactionAnalysis && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Relationship Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Relationship Strength
                </span>
                <span className="text-sm text-gray-500">
                  {interactionAnalysis && 'relationshipStrength' in interactionAnalysis ? Math.round((interactionAnalysis.relationshipStrength as number) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: interactionAnalysis && 'relationshipStrength' in interactionAnalysis ? `${(interactionAnalysis.relationshipStrength as number) * 100}%` : '0%'
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Sentiment
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(interactionAnalysis.overallSentiment * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    interactionAnalysis.overallSentiment > 0
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.abs(interactionAnalysis.overallSentiment) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Topics and Action Items */}
      {interactionAnalysis && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Key Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {interactionAnalysis.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {topic.topics[0] || 'N/A'}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Action Items
              </h4>
              <ul className="space-y-1">
                {interactionAnalysis.actionItems.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm text-gray-600 flex items-center"
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    {item.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Trends Visualization */}
      {trends && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Trends</h3>
          <div className="space-y-4">
            {/* Relationship Trend */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Relationship Trend
              </h4>
              <div className="h-32 flex items-end space-x-1">
                {trends.relationshipTrend.map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500 rounded-t"
                    style={{ height: `${value * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Sentiment Trend */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Sentiment Trend
              </h4>
              <div className="h-32 flex items-center space-x-1">
                {trends.sentimentTrend.map((value, index) => (
                  <div
                    key={index}
                    className={`flex-1 rounded-t ${
                      value > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${Math.abs(value) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Topic Evolution */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Topic Evolution
              </h4>
              <div className="space-y-2">
                {Object.entries(trends.topicEvolution).map(([topic, values]) => (
                  <div key={topic} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">{topic}</span>
                      <span className="text-xs text-gray-500">
                        {Math.round(
                          (values.filter(v => v === 1).length / values.length) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${
                            (values.filter(v => v === 1).length / values.length) *
                            100
                          }%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 