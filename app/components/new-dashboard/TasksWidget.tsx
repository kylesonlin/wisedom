"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { CheckCircle2, Circle, Plus } from "lucide-react"

import { Button } from "./ui/Button"
import { Card, CardContent } from "./ui/Card"
import { Input } from "./ui/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs"

interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Follow up with client about proposal",
    completed: false,
    createdAt: "2024-03-10T10:00:00Z",
  },
  {
    id: "2",
    title: "Update contact information",
    completed: true,
    createdAt: "2024-03-09T15:30:00Z",
  },
  {
    id: "3",
    title: "Schedule team meeting",
    completed: false,
    createdAt: "2024-03-09T09:00:00Z",
  },
  {
    id: "4",
    title: "Review project timeline",
    completed: false,
    createdAt: "2024-03-08T14:20:00Z",
  },
]

export function TasksWidget() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState("")

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
          .order("createdAt", { ascending: false })

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

  const toggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setTasks(updatedTasks)

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase
        .from("tasks")
        .update({ completed: !tasks.find((t) => t.id === taskId)?.completed })
        .eq("id", taskId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating task:", error)
      // Revert the change if the update fails
      setTasks(tasks)
    }
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setTasks([newTask, ...tasks])
    setNewTaskTitle("")

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase.from("tasks").insert([newTask])

      if (error) throw error
    } catch (error) {
      console.error("Error adding task:", error)
      // Remove the task if the insert fails
      setTasks(tasks)
    }
  }

  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Add a new task..."
              value={newTaskTitle}
              onValueChange={(value: string) => setNewTaskTitle(value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
            />
            <Button onClick={addTask}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add task</span>
            </Button>
          </div>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                Active ({activeTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedTasks.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4">
              <div className="space-y-2">
                {activeTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-2"
                    onClick={() => toggleTask(task.id)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full p-0"
                    >
                      <Circle className="h-4 w-4" />
                      <span className="sr-only">Mark as complete</span>
                    </Button>
                    <span className="flex-1 text-sm">{task.title}</span>
                  </div>
                ))}
                {activeTasks.length === 0 && (
                  <p className="text-center text-sm text-gray-500">
                    No active tasks
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-2 opacity-50"
                    onClick={() => toggleTask(task.id)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full p-0 text-green-500"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="sr-only">Mark as incomplete</span>
                    </Button>
                    <span className="flex-1 text-sm line-through">
                      {task.title}
                    </span>
                  </div>
                ))}
                {completedTasks.length === 0 && (
                  <p className="text-center text-sm text-gray-500">
                    No completed tasks
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
} 