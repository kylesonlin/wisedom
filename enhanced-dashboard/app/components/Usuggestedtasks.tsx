"use client"

import * as React from "react"
import { useState } from "react"
import { CheckCircle2, Circle, Clock, MessageSquare, Phone, UserPlus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/Uavatar"
import { Button } from "../../components/ui/Ubutton"
import { Badge } from "../../components/ui/Ubadge"
import { Separator } from "../../components/ui/Useparator"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Ucard"

const tasks = [
  {
    id: 1,
    type: "follow_up",
    title: "Follow up with Sarah Johnson",
    description: "Last contacted 2 weeks ago about the marketing proposal",
    priority: "high",
    person: {
      name: "Sarah Johnson",
      role: "Marketing Director",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    completed: false,
  },
  {
    id: 2,
    type: "connect",
    title: "Connect with David Lee",
    description: "Suggested connection based on your network",
    priority: "medium",
    person: {
      name: "David Lee",
      role: "Product Manager",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    completed: false,
  },
  {
    id: 3,
    type: "call",
    title: "Schedule call with Alex Rodriguez",
    description: "Quarterly check-in for ongoing projects",
    priority: "medium",
    person: {
      name: "Alex Rodriguez",
      role: "Sales Manager",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    completed: false,
  },
  {
    id: 4,
    type: "message",
    title: "Reply to Emily Wilson",
    description: "Regarding the upcoming team building event",
    priority: "low",
    person: {
      name: "Emily Wilson",
      role: "HR Specialist",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    completed: true,
  },
]

export function SuggestedTasks() {
  const [tasksList, setTasksList] = useState(tasks)

  const toggleTask = (id: number) => {
    setTasksList(tasksList.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const activeTasks = tasksList.filter((task) => !task.completed)
  const completedTasks = tasksList.filter((task) => task.completed)

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {activeTasks.map((task) => (
          <div key={task.id} className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full p-0 text-muted-foreground mt-0.5"
              onClick={() => toggleTask(task.id)}
            >
              <Circle className="h-4 w-4" />
              <span className="sr-only">Mark as complete</span>
            </Button>
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-sm">{task.title}</h3>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1 py-0 h-4 ${
                    task.priority === "high"
                      ? "border-red-200 bg-red-50 text-red-600"
                      : task.priority === "medium"
                        ? "border-amber-200 bg-amber-50 text-amber-600"
                        : "border-green-200 bg-green-50 text-green-600"
                  }`}
                >
                  {task.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={task.person.avatar || "/placeholder.svg"} alt={task.person.name} />
                    <AvatarFallback>{task.person.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{task.person.name}</span>
                </div>
                <div className="flex gap-1">
                  {task.type === "follow_up" && (
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>Remind</span>
                    </Button>
                  )}
                  {task.type === "connect" && (
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                      <UserPlus className="mr-1 h-3 w-3" />
                      <span>Connect</span>
                    </Button>
                  )}
                  {task.type === "call" && (
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                      <Phone className="mr-1 h-3 w-3" />
                      <span>Call</span>
                    </Button>
                  )}
                  {task.type === "message" && (
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      <span>Message</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {completedTasks.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
            {completedTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 opacity-70">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded-full p-0 text-green-500 mt-0.5"
                  onClick={() => toggleTask(task.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="sr-only">Mark as incomplete</span>
                </Button>
                <div className="flex-1">
                  <h3 className="font-medium text-sm line-through">{task.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
