import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Ucard";
import { Progress } from "@/components/ui/progress";

interface ProjectProgressProps {
  projects: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
  }>;
}

export function UProjectProgress({ projects }: ProjectProgressProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-500";
      case "at-risk":
        return "bg-yellow-500";
      case "delayed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "on-track":
        return "On Track";
      case "at-risk":
        return "At Risk";
      case "delayed":
        return "Delayed";
      default:
        return "Unknown";
    }
  };

  return (
    <Card role="region" aria-label="Project Progress">
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4" role="list">
          {projects.map((project, index) => (
            <div 
              key={project.id} 
              className="space-y-2"
              role="listitem"
              aria-label={`${project.name} - ${getStatusLabel(project.status)} - ${project.progress}% complete`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{project.name}</span>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${getStatusColor(project.status)}`}
                  role="status"
                  aria-label={`Status: ${getStatusLabel(project.status)}`}
                />
              </div>
              <Progress 
                value={project.progress} 
                className="h-2"
                aria-label={`Progress: ${project.progress}%`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={project.progress}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
