import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Ucard"
import { Button } from "@/components/ui/Ubutton"
import { Badge } from "@/components/ui/Ubadge"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

const tasks = [
  {
    title: "Follow up with Client A",
    description: "Send project update and schedule next meeting",
    priority: "High",
    dueDate: "2024-03-22",
    status: "Pending",
  },
  {
    title: "Review Project Proposal",
    description: "Review and provide feedback on the new project proposal",
    priority: "Medium",
    dueDate: "2024-03-23",
    status: "In Progress",
  },
  {
    title: "Update Documentation",
    description: "Update project documentation with latest changes",
    priority: "Low",
    dueDate: "2024-03-24",
    status: "Not Started",
  },
]

export function SuggestedTasks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Tasks</CardTitle>
        <CardDescription>Recommended tasks based on your activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none">{task.title}</p>
                  <Badge
                    variant={
                      task.priority === "High"
                        ? "destructive"
                        : task.priority === "Medium"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    Due: {task.dueDate}
                  </div>
                  <div className="flex items-center">
                    {task.status === "Completed" ? (
                      <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                    ) : task.status === "In Progress" ? (
                      <AlertCircle className="mr-1 h-3 w-3 text-yellow-500" />
                    ) : (
                      <Clock className="mr-1 h-3 w-3" />
                    )}
                    {task.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-4 w-full">
          View All Tasks
        </Button>
      </CardContent>
    </Card>
  )
} 