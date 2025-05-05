import React, { useState, useEffect } from 'react';
import { Project, Task, Milestone, ProjectContact } from '../types/project';
import { Contact } from '../types/contact';
import { Interaction } from '../types/interaction';
import {
  createProject,
  updateProject,
  addProjectMember,
  addProjectContact,
  createTask,
  updateTask,
  createMilestone,
  getProjectDetails,
  getProjectsByUser,
  getProjectContacts,
  getProjectTasks,
  getProjectMilestones
} from '../utils/projectManagement';
import ProjectAnalyticsComponent from './ProjectAnalytics';

interface ProjectDashboardProps {
  userId: string;
  contacts: Contact[];
  interactions: Interaction[];
}

export default function ProjectDashboard({ userId, contacts, interactions }: ProjectDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  });

  // Load projects
  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjectsByUser(userId);
        setProjects(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    loadProjects();
  }, [userId]);

  // Handle project selection
  const handleProjectSelect = async (projectId: string) => {
    try {
      const project = await getProjectDetails(projectId);
      setSelectedProject(project);
      setShowAnalytics(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Create new project
  const handleCreateProject = async () => {
    try {
      const project = await createProject(newProject as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>);
      setProjects([...projects, project]);
      setShowNewProjectModal(false);
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Project Dashboard</h1>
        <div className="space-x-4">
          {selectedProject && (
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
          )}
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create New Project
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <div
            key={project.id}
            className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md"
            onClick={() => handleProjectSelect(project.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-sm text-gray-500">{project.description}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  project.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : project.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : project.status === 'on-hold'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {project.status}
              </span>
            </div>
            <div className="mt-4 flex justify-between text-sm text-gray-500">
              <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
              <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Project Details or Analytics */}
      {selectedProject && (
        showAnalytics ? (
          <ProjectAnalyticsComponent
            project={selectedProject}
            contacts={contacts}
            interactions={interactions}
          />
        ) : (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">{selectedProject.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Overview */}
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Project Overview</h3>
                <p className="text-gray-600">{selectedProject.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span>{selectedProject.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Priority:</span>
                    <span>{selectedProject.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Team Members:</span>
                    <span>{selectedProject.teamMembers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contacts:</span>
                    <span>{selectedProject.contacts.length}</span>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Tasks</h3>
                <div className="space-y-2">
                  {selectedProject.tasks.map(task => (
                    <div key={task.id} className="border rounded p-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{task.title}</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      <div className="text-xs text-gray-400 mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Milestones</h3>
                <div className="space-y-2">
                  {selectedProject.milestones.map(milestone => (
                    <div key={milestone.id} className="border rounded p-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{milestone.title}</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            milestone.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : milestone.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {milestone.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                      <div className="text-xs text-gray-400 mt-1">
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contacts */}
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Project Contacts</h3>
                <div className="space-y-2">
                  {selectedProject.contacts.map(contact => {
                    const contactDetails = contacts.find(c => c.id === contact.contactId);
                    return (
                      <div key={contact.contactId} className="border rounded p-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{contactDetails?.name}</span>
                          <span className="text-sm text-gray-500">{contact.role}</span>
                        </div>
                        <p className="text-sm text-gray-500">{contactDetails?.company}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={new Date(newProject.startDate!).toISOString().split('T')[0]}
                  onChange={(e) => setNewProject({ ...newProject, startDate: new Date(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={new Date(newProject.endDate!).toISOString().split('T')[0]}
                  onChange={(e) => setNewProject({ ...newProject, endDate: new Date(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 