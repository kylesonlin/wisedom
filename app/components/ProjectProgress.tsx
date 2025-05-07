"use client"

import * as React from "react"
import { CheckCircle2, Clock, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Progress } from "@/components/ui/Progress"

import { cn } from "@/lib/utils"

const projects = [
  {
    id: 1,
    name: "Website Redesign",
    progress: 75,
    status: "In Progress",
    dueDate: "May 15, 2023",
    team: ["A", "B", "C"],
  },
  {
    id: 2,
    name: "Marketing Campaign",
    progress: 90,
    status: "In Progress",
    dueDate: "May 20, 2023",
    team: ["D", "E"],
  },
  {
    id: 3,
    name: "Product Launch",
    progress: 45,
    status: "In Progress",
    dueDate: "June 5, 2023",
    team: ["A", "F", "G"],
  },
  {
    id: 4,
    name: "Client Presentation",
    progress: 100,
    status: "Completed",
    dueDate: "May 2, 2023",
    team: ["B", "D"],
  },
]

export function ProjectProgress() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Project Progress</h3>
          <p className="text-xs text-muted-foreground">Track your ongoing projects</p>
        </div>
        <Button variant="outline" size="sm" className="h-7">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-4 overflow-auto flex-1">
        {projects.map((project) => (
          <Card key={project.id} className={project.status === "Completed" ? "bg-muted/50" : ""}>
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {project.name}
                {project.status === "Completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">Due: {project.dueDate}</div>
                  <div className="flex -space-x-2">
                    {project.team.map((member, i) => (
                      <div
                        key={i}
                        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-medium text-primary-foreground"
                      >
                        {member}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 