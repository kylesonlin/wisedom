"use client"

import * as React from "react"
import { CalendarClock, FileText, MessageSquare, UserPlus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

const activities = [
  {
    id: 1,
    type: "connection",
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    time: "2 hours ago",
    description: "Connected with you",
    icon: UserPlus,
  },
  {
    id: 2,
    type: "message",
    user: {
      name: "Sam Rivera",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    time: "Yesterday",
    description: "Sent you a message",
    preview: "Hey, I wanted to follow up on our discussion about...",
    icon: MessageSquare,
  },
  {
    id: 3,
    type: "document",
    user: {
      name: "Taylor Kim",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    time: "2 days ago",
    description: "Shared a document",
    documentName: "Q2 Marketing Strategy.pdf",
    icon: FileText,
  },
  {
    id: 4,
    type: "meeting",
    user: {
      name: "Jordan Patel",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    time: "3 days ago",
    description: "Scheduled a meeting",
    meetingTime: "May 10, 2023 at 2:00 PM",
    icon: CalendarClock,
  },
]

export function RecentActivity() {
  return (
    <div className="h-full">
      <Card className="h-full border-0 shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.user.name}</p>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <activity.icon className="h-3.5 w-3.5" />
                    <span>{activity.description}</span>
                  </div>
                  {activity.type === "message" && (
                    <p className="text-xs border-l-2 border-muted pl-2 italic">{activity.preview}</p>
                  )}
                  {activity.type === "document" && (
                    <p className="text-xs flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {activity.documentName}
                    </p>
                  )}
                  {activity.type === "meeting" && (
                    <p className="text-xs flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {activity.meetingTime}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-xs h-8">
            View All Activity
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 