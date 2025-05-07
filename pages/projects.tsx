import React from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      name: 'Project Alpha',
      description: 'A cutting-edge web application',
      status: 'In Progress',
      progress: 75,
      team: ['John D.', 'Sarah M.', 'Mike R.'],
      dueDate: '2024-03-15',
    },
    {
      id: 2,
      name: 'Project Beta',
      description: 'Mobile app development',
      status: 'Planning',
      progress: 25,
      team: ['Emma S.', 'David L.'],
      dueDate: '2024-04-01',
    },
    {
      id: 3,
      name: 'Project Gamma',
      description: 'Data analytics platform',
      status: 'Completed',
      progress: 100,
      team: ['Alex K.', 'Lisa P.', 'Tom B.', 'Rachel H.'],
      dueDate: '2024-02-28',
    },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button>New Project</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-sm text-gray-500">{project.description}</p>
                </div>
                <Badge
                  variant={
                    project.status === 'Completed'
                      ? 'default'
                      : project.status === 'In Progress'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {project.status}
                </Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Team</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.team.map((member) => (
                      <Badge key={member} variant="outline">
                        {member}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    Due: {new Date(project.dueDate).toLocaleDateString()}
                  </span>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
} 