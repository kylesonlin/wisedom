"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

const activities = [
  {
    id: "1",
    type: "contact_added",
    user: {
      name: "John Doe",
      email: "john@example.com",
      image: "/avatars/01.png",
    },
    timestamp: "2024-03-10T10:00:00Z",
  },
  {
    id: "2",
    type: "task_completed",
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
      image: "/avatars/02.png",
    },
    timestamp: "2024-03-10T09:30:00Z",
  },
  {
    id: "3",
    type: "meeting_scheduled",
    user: {
      name: "Mike Johnson",
      email: "mike@example.com",
      image: "/avatars/03.png",
    },
    timestamp: "2024-03-10T09:00:00Z",
  },
]

interface Activity {
  id: string
  type: string
  user: {
    name: string
    email: string
    image: string
  }
  timestamp: string
}

export function RecentActivity() {
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(5)

        if (error) throw error

        setRecentActivities(data || activities) // Fallback to mock data if no data
      } catch (error) {
        console.error("Error fetching activities:", error)
        setRecentActivities(activities) // Use mock data on error
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "contact_added":
        return "👤"
      case "task_completed":
        return "✅"
      case "meeting_scheduled":
        return "📅"
      default:
        return "📝"
    }
  }

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "contact_added":
        return "added a new contact"
      case "task_completed":
        return "completed a task"
      case "meeting_scheduled":
        return "scheduled a meeting"
      default:
        return "performed an action"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={activity.user.image} alt={activity.user.name} />
                <AvatarFallback>
                  {activity.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user.name}{" "}
                  <span className="text-gray-500">{getActivityText(activity)}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()} at{" "}
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <span className="text-2xl">{getActivityIcon(activity.type)}</span>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <div className="text-center text-gray-500">No recent activity</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 