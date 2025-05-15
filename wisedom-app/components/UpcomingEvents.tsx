import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Calendar, Clock, MapPin } from "lucide-react"

const events = [
  {
    title: "Team Meeting",
    description: "Weekly team sync and project updates",
    date: "2024-03-25",
    time: "10:00 AM",
    location: "Conference Room A",
    type: "Meeting",
  },
  {
    title: "Client Presentation",
    description: "Product demo for new client",
    date: "2024-03-26",
    time: "2:00 PM",
    location: "Virtual Meeting",
    type: "Presentation",
  },
  {
    title: "Project Deadline",
    description: "Final submission for Q1 project",
    date: "2024-03-28",
    time: "5:00 PM",
    location: "Office",
    type: "Deadline",
  },
]

export function UpcomingEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Your schedule for the next few days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{event.title}</p>
                  <Badge variant="secondary">{event.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {event.date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    {event.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-4 w-full">
          View Calendar
        </Button>
      </CardContent>
    </Card>
  )
} 