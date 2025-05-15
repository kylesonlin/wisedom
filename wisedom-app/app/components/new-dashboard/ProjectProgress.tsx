"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Progress } from "@/components/ui/Progress"

interface Project {
  id: string
  name: string
  progress: number
  status: "on-track" | "at-risk" | "delayed"
  last_updated: string
}

export function ProjectProgress() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("last_updated", { ascending: false })

        if (error) throw error

        setProjects(data || [])
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "on-track":
        return "bg-green-500"
      case "at-risk":
        return "bg-yellow-500"
      case "delayed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "on-track":
        return "On Track"
      case "at-risk":
        return "At Risk"
      case "delayed":
        return "Delayed"
      default:
        return "Unknown"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-2 w-1/2 animate-pulse rounded bg-gray-200" />
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
        <CardTitle>Project Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{project.name}</h3>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                    project.status
                  )} text-white`}
                >
                  {getStatusText(project.status)}
                </span>
              </div>
              <Progress value={project.progress} className="h-2" />
              <p className="text-sm text-gray-500">
                Last updated: {new Date(project.last_updated).toLocaleDateString()}
              </p>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="text-center text-gray-500">
              No projects found. Add your first project to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 