"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { CheckCircle2, Circle, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/Button/index"
import { Card, CardContent } from "@/components/ui/Card/index"
import { Input } from "@/components/ui/Input/index"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs/index"

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string
  userId: string
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Follow up with client about proposal",
    completed: false,
    createdAt: "2024-03-10T10:00:00Z",
    userId: "",
  },
  {
    id: "2",
    title: "Update contact information",
    completed: true,
    createdAt: "2024-03-09T15:30:00Z",
    userId: "",
  },
  {
    id: "3",
    title: "Schedule team meeting",
    completed: false,
    createdAt: "2024-03-09T09:00:00Z",
    userId: "",
  },
  {
    id: "4",
    title: "Review project timeline",
    completed: false,
    createdAt: "2024-03-08T14:20:00Z",
    userId: "",
  },
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function TasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all")

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("createdAt", { ascending: false })

      if (error) throw error

      setTasks(data || mockTasks)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
      setTasks(mockTasks)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      const { data, error } = await supabase.from("tasks").insert([
        {
          title: newTaskTitle,
          completed: false,
        },
      ])

      if (error) throw error

      if (data) {
        setTasks([...tasks, data[0]])
        setNewTaskTitle("")
      }
    } catch (err) {
      console.error("Error adding task:", err)
      setError(err instanceof Error ? err.message : "Failed to add task")
    }
  }

  const toggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", taskId)

      if (error) throw error

      setTasks(
        tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      )
    } catch (err) {
      console.error("Error toggling task:", err)
      setError(err instanceof Error ? err.message : "Failed to toggle task")
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error

      setTasks(tasks.filter((t) => t.id !== taskId))
    } catch (err) {
      console.error("Error deleting task:", err)
      setError(err instanceof Error ? err.message : "Failed to delete task")
    }
  }

  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case "completed":
        return task.completed
      case "incomplete":
        return !task.completed
      default:
        return true
    }
  })

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      await addTask()
      return false
    }
  }

  if (loading) return <div>Loading tasks...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={addTask} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
          <TabsList className="mt-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
          </TabsList>
          <TabsContent value={filter}>
            <div className="mt-4 space-y-2">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between space-x-2"
                >
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </Button>
                    <span
                      className={`${
                        task.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                  >
                    <span className="sr-only">Delete</span>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 