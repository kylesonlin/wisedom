"use client"

import { LineChart, BarChart, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"

export function AIInsights() {
  return (
    <div className="h-full">
      <Tabs defaultValue="insights" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="insights" className="flex-1 overflow-auto">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Network Growth</CardTitle>
                <CardDescription>Your network has grown 23% this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32">
                  <LineChart className="h-16 w-16 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  AI analysis suggests focusing on industry events to accelerate growth.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Engagement Patterns</CardTitle>
                <CardDescription>Your most active connections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-32">
                  <BarChart className="h-16 w-16 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tech and finance sectors show highest engagement with your content.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="recommendations" className="flex-1 overflow-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Personalized Recommendations</CardTitle>
              <CardDescription>Based on your recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Connect with 3 potential clients</p>
                    <p className="text-xs text-muted-foreground">
                      AI identified these connections based on your business goals.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Share industry report</p>
                    <p className="text-xs text-muted-foreground">This content aligns with your audience's interests.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Schedule follow-ups</p>
                    <p className="text-xs text-muted-foreground">5 connections haven't heard from you in 30+ days.</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends" className="flex-1 overflow-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Industry Trends</CardTitle>
              <CardDescription>AI-detected trends relevant to your network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">AI Integration in Marketing</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    73% of your connections are discussing AI-powered marketing tools.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">Remote Work Policies</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trending topic among 42% of your enterprise connections.
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <h4 className="font-medium">Sustainability Initiatives</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Growing focus area with 38% increase in related content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 