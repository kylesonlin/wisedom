"use client"

import { useState } from "react"
import { BarChart, LineChart, PieChart } from "lucide-react"

import { Button } from "./ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs"

export function NetworkOverview() {
  const [timeframe, setTimeframe] = useState("month")

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Network Overview</h3>
        <div className="flex items-center gap-1">
          <Button
            variant={timeframe === "week" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("week")}
            className="h-7 text-xs"
          >
            Week
          </Button>
          <Button
            variant={timeframe === "month" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("month")}
            className="h-7 text-xs"
          >
            Month
          </Button>
          <Button
            variant={timeframe === "year" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("year")}
            className="h-7 text-xs"
          >
            Year
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="h-[calc(100%-2rem)]">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="h-[calc(100%-2rem)] overflow-auto">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">248</span>
                  <span className="text-xs text-green-500 ml-2">+12%</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <LineChart className="h-16 w-16 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Engagement</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold">64%</span>
                  <span className="text-xs text-green-500 ml-2">+5%</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <BarChart className="h-16 w-16 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Industry Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <PieChart className="h-16 w-16 text-primary" />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span>Technology (42%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Finance (28%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <span>Healthcare (15%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span>Other (15%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="growth" className="h-[calc(100%-2rem)] overflow-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Network Growth</CardTitle>
              <CardDescription>New connections over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48">
                <LineChart className="h-32 w-32 text-primary" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>New connections this {timeframe}</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Connection requests</span>
                  <span className="font-medium">18</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending invitations</span>
                  <span className="font-medium">7</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement" className="h-[calc(100%-2rem)] overflow-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Engagement Metrics</CardTitle>
              <CardDescription>How your network interacts with you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-48">
                <BarChart className="h-32 w-32 text-primary" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Messages exchanged</span>
                  <span className="font-medium">156</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Content interactions</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Meeting attendance</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 