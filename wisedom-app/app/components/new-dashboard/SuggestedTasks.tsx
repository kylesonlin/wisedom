"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Separator } from "@/components/ui/Separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

interface Task {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  assignee: {
    name: string
    image: string
  }
  dueDate: string
  status: "pending" | "in-progress" | "completed"
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Follow up with potential client",
    description: "Send follow-up email to discuss project requirements",
    priority: "high",
    assignee: {
      name: "John Doe",
      image: "/avatars/01.png",
    },
    dueDate: "2024-03-15",
    status: "pending",
  },
  {
    id: "2",
    title: "Update contact database",
    description: "Add new contacts from recent networking event",
    priority: "medium",
    assignee: {
      name: "Jane Smith",
      image: "/avatars/02.png",
    },
    dueDate: "2024-03-20",
    status: "in-progress",
  },
  {
    id: "3",
    title: "Prepare client presentation",
    description: "Create slides for upcoming client meeting",
    priority: "high",
    assignee: {
      name: "Mike Johnson",
      image: "/avatars/03.png",
    },
    dueDate: "2024-03-18",
    status: "pending",
  },
]

export function SuggestedTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .order("priority", { ascending: false })
          .limit(3)

        if (error) throw error

        setTasks(data || mockTasks) // Fallback to mock data if no data
      } catch (error) {
        console.error("Error fetching tasks:", error)
        setTasks(mockTasks) // Use mock data on error
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suggested Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
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
        <CardTitle>Suggested Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={task.id}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.image} alt={task.assignee.name} />
                      <AvatarFallback>
                        {task.assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-500">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                </div>
              </div>
              {index < tasks.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-gray-500">No tasks found</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 