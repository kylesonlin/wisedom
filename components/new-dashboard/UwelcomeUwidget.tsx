"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { ArrowRight, Calendar, CheckCircle2, Clock, Users } from "lucide-react"

import { Button } from "./ui/Ubutton"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/Ucard"

interface Stats {
  totalContacts: number
  completedTasks: number
  upcomingMeetings: number
}

const mockStats: Stats = {
  totalContacts: 150,
  completedTasks: 12,
  upcomingMeetings: 5,
}

export function WelcomeWidget() {
  const [stats, setStats] = useState<Stats>(mockStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Fetch total contacts
        const { count: contactsCount, error: contactsError } = await supabase
          .from("contacts")
          .select("*", { count: "exact" })

        if (contactsError) throw contactsError

        // Fetch completed tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("completed", true)

        if (tasksError) throw tasksError

        // Fetch upcoming meetings
        const { data: meetingsData, error: meetingsError } = await supabase
          .from("events")
          .select("*")
          .gte("date", new Date().toISOString())
          .eq("type", "meeting")

        if (meetingsError) throw meetingsError

        setStats({
          totalContacts: contactsCount || mockStats.totalContacts,
          completedTasks: tasksData?.length || mockStats.completedTasks,
          upcomingMeetings: meetingsData?.length || mockStats.upcomingMeetings,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        setStats(mockStats) // Use mock data on error
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse bg-gray-200 h-6 w-1/3 rounded" />
          <CardDescription className="animate-pulse bg-gray-200 h-4 w-2/3 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
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
        <CardTitle>Welcome back!</CardTitle>
        <CardDescription>
          Here's what's happening with your network today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{stats.totalContacts}</div>
              <div className="text-sm text-gray-500">Total Contacts</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <div className="text-sm text-gray-500">Tasks Completed</div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Calendar className="h-8 w-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
              <div className="text-sm text-gray-500">Upcoming Meetings</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          View Detailed Analytics
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
