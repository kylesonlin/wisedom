"use client"

import * as React from "react"
import { LineChart, BarChart, Activity, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui"

interface InsightData {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

interface RecommendationData {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export default function AIInsights() {
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations' | 'trends'>('insights');

  const insights: InsightData[] = [
    {
      title: "Network Growth",
      value: "+15%",
      change: 15,
      trend: 'up',
    },
    {
      title: "Engagement Rate",
      value: "8.2%",
      change: -2,
      trend: 'down',
    },
    {
      title: "Response Time",
      value: "2.5h",
      change: 0,
      trend: 'neutral',
    },
  ];

  const recommendations: RecommendationData[] = [
    {
      title: "Increase Follow-ups",
      description: "Schedule more follow-up meetings with key contacts",
      impact: 'high',
    },
    {
      title: "Optimize Response Time",
      description: "Try to respond to messages within 2 hours",
      impact: 'medium',
    },
    {
      title: "Network Expansion",
      description: "Connect with more industry professionals",
      impact: 'low',
    },
  ];

  return (
    <div className="h-full">
      <div className="flex flex-col h-full">
        <div className="grid w-full grid-cols-3 gap-1 rounded-lg bg-muted p-1 mb-4">
          <button
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              activeTab === 'insights'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            )}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
          <button
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              activeTab === 'recommendations'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            )}
            onClick={() => setActiveTab('recommendations')}
          >
            Recommendations
          </button>
          <button
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              activeTab === 'trends'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50"
            )}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
        </div>

        <div className="flex-1">
          {activeTab === 'insights' && (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card text-card-foreground"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">{insight.title}</h3>
                    <span className="text-2xl font-bold">{insight.value}</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <span
                      className={cn(
                        "inline-flex items-center",
                        insight.trend === 'up'
                          ? "text-green-600"
                          : insight.trend === 'down'
                          ? "text-red-600"
                          : "text-gray-600"
                      )}
                    >
                      {insight.change > 0 ? "+" : ""}
                      {insight.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card text-card-foreground"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium">{recommendation.title}</h3>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded",
                        recommendation.impact === 'high'
                          ? "bg-red-100 text-red-800"
                          : recommendation.impact === 'medium'
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      )}
                    >
                      {recommendation.impact}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {recommendation.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="p-4 text-center text-muted-foreground">
              Trend analysis coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 