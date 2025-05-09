"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Calendar, Clock, MapPin } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar"
import { Button } from "./ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"

interface Event {
  id: string
  title: string
  type: "meeting" | "call" | "task"
  date: string
  time: string
  location?: string
  attendees: {
    name: string
    image: string
  }[]
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Client Strategy Meeting",
    type: "meeting",
    date: "2024-03-15",
    time: "10:00 AM",
    location: "Conference Room A",
    attendees: [
      { name: "John Doe", image: "/avatars/01.png" },
      { name: "Jane Smith", image: "/avatars/02.png" },
      { name: "Mike Johnson", image: "/avatars/03.png" },
    ],
  },
  {
    id: "2",
    title: "Project Review Call",
    type: "call",
    date: "2024-03-16",
    time: "2:30 PM",
    attendees: [
      { name: "Sarah Wilson", image: "/avatars/04.png" },
      { name: "Tom Brown", image: "/avatars/05.png" },
    ],
  },
  {
    id: "3",
    title: "Team Sync",
    type: "meeting",
    date: "2024-03-17",
    time: "11:00 AM",
    location: "Meeting Room B",
    attendees: [
      { name: "Alex Lee", image: "/avatars/06.png" },
      { name: "Emily Davis", image: "/avatars/07.png" },
      { name: "Chris Taylor", image: "/avatars/08.png" },
    ],
  },
]

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true })
          .limit(5)

        if (error) throw error

        setEvents(data || mockEvents) // Fallback to mock data if no data
      } catch (error) {
        console.error("Error fetching events:", error)
        setEvents(mockEvents) // Use mock data on error
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const today = new Date()
  const todayEvents = events.filter(
    (event) => new Date(event.date).toDateString() === today.toDateString()
  )
  const upcomingEvents = events.filter(
    (event) => new Date(event.date) > today
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
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
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today">Today ({todayEvents.length})</TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="mt-4">
            <div className="space-y-4">
              {todayEvents.map((event) => (
                <div key={event.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{event.title}</h3>
                    <Button variant="outline" size="sm">
                      Join
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {event.time}
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                  <div className="flex -space-x-2">
                    {event.attendees.map((attendee, index) => (
                      <Avatar key={index} className="border-2 border-white">
                        <AvatarImage src={attendee.image} alt={attendee.name} />
                        <AvatarFallback>
                          {attendee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              ))}
              {todayEvents.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  No events scheduled for today
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{event.title}</h3>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {event.time}
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {event.attendees.map((attendee, index) => (
                      <Avatar key={index} className="border-2 border-white">
                        <AvatarImage src={attendee.image} alt={attendee.name} />
                        <AvatarFallback>
                          {attendee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  No upcoming events scheduled
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 