"use client"

import * as React from "react"

import { useState } from "react"
import { CheckCircle2, Circle, Plus } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"

const initialTasks = [
  {
    id: 1,
    title: "Prepare client presentation",
    completed: false,
    dueDate: "Today",
    priority: "high",
  },
  {
    id: 2,
    title: "Review marketing materials",
    completed: false,
    dueDate: "Tomorrow",
    priority: "medium",
  },
  {
    id: 3,
    title: "Schedule team meeting",
    completed: true,
    dueDate: "Yesterday",
    priority: "medium",
  },
  {
    id: 4,
    title: "Send follow-up emails",
    completed: false,
    dueDate: "May 12",
    priority: "low",
  },
  {
    id: 5,
    title: "Update project timeline",
    completed: false,
    dueDate: "May 15",
    priority: "high",
  },
]

export function TasksWidget() {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState("")

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const task = {
      id: Date.now(),
      title: newTask,
      completed: false,
      dueDate: "Today",
      priority: "medium",
    }

    setTasks([task, ...tasks])
    setNewTask("")
  }

  const activeTasks = tasks.filter((task) => !task.completed)
  const completedTasks = tasks.filter((task) => task.completed)

  return (
    <div className="h-full">
      <Tabs defaultValue="active" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 bg-dashboard-secondary">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-dashboard-primary data-[state=active]:text-white"
          >
            Active ({activeTasks.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-dashboard-primary data-[state=active]:text-white"
          >
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>
        <form onSubmit={addTask} className="flex items-center gap-2 my-2">
          <Input
            placeholder="Add a new task..."
            value={newTask}
            onValueChange={(value: string) => setNewTask(value)}
            className="h-8"
          />
          <Button type="submit" size="sm" className="h-8 px-2 dashboard-button">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        <TabsContent value="active" className="flex-1 overflow-auto">
          <div className="space-y-2">
            {activeTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden dashboard-card">
                <CardContent className="p-2">
                  <div className="flex items-start gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full p-0 text-muted-foreground hover:bg-dashboard-primary hover:text-white"
                      onClick={() => toggleTask(task.id)}
                    >
                      <Circle className="h-4 w-4" />
                      <span className="sr-only">Mark as complete</span>
                    </Button>
                    <div className="grid gap-1">
                      <div className="font-medium dashboard-body">{task.title}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Due {task.dueDate}</span>
                        <span className="mx-1">•</span>
                        <span
                          className={`capitalize ${
                            task.priority === "high"
                              ? "priority-high"
                              : task.priority === "medium"
                                ? "priority-medium"
                                : "priority-low"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="flex-1 overflow-auto">
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden bg-muted/50 dashboard-card">
                <CardContent className="p-2">
                  <div className="flex items-start gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full p-0 text-dashboard-accent hover:bg-dashboard-primary hover:text-white"
                      onClick={() => toggleTask(task.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="sr-only">Mark as incomplete</span>
                    </Button>
                    <div className="grid gap-1">
                      <div className="font-medium line-through text-muted-foreground dashboard-body">{task.title}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Completed</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 