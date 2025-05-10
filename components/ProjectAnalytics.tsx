"use client";

import React, { useState, useEffect } from 'react';
import { Project, Task, Milestone } from '../types/project';
import { Contact } from '../types/contact';
import { Interaction } from '../types/interaction';
import { ProjectAnalytics, ActionItem, calculateProjectAnalytics, generateActionItems } from '../utils/projectAnalytics';
import { websocketService } from '../utils/websocketService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Only register Chart.js components on the client side
if (typeof window !== 'undefined') {
  ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    TimeScale
  );
}

interface ProjectAnalyticsProps {
  project: Project;
  contacts: Contact[];
  interactions: Interaction[];
}

export default function ProjectAnalyticsComponent({ project, contacts, interactions }: ProjectAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function loadAnalytics() {
      try {
        const analyticsData = await calculateProjectAnalytics(project, contacts, interactions);
        const actionItemsData = generateActionItems(project, contacts, interactions);
        setAnalytics(analyticsData);
        setActionItems(actionItemsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading analytics:', error);
        setLoading(false);
      }
    }

    loadAnalytics();

    // Subscribe to real-time updates
    const unsubscribe = websocketService.subscribe((event) => {
      if (event.type === 'projectUpdate' && event.data.id === project.id) {
        loadAnalytics();
      } else if (event.type === 'taskUpdate' && project.tasks.some(t => t.id === event.data.id)) {
        loadAnalytics();
      } else if (event.type === 'milestoneUpdate' && project.milestones.some(m => m.id === event.data.id)) {
        loadAnalytics();
      } else if (event.type === 'interactionUpdate' && interactions.some(i => i.id === event.data.id)) {
        loadAnalytics();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [project, contacts, interactions]);

  if (typeof window === 'undefined') {
    return null;
  }

  if (loading) return <div className="p-4">Loading analytics...</div>;
  if (!analytics) return <div className="p-4 text-red-500">Error loading analytics</div>;

  // Task distribution chart data
  const taskDistributionData = {
    labels: ['To Do', 'In Progress', 'Review', 'Completed'],
    datasets: [
      {
        data: [
          analytics.taskDistribution.todo,
          analytics.taskDistribution.inProgress,
          analytics.taskDistribution.review,
          analytics.taskDistribution.completed,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  // Priority distribution chart data
  const priorityDistributionData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [
          analytics.priorityDistribution.high,
          analytics.priorityDistribution.medium,
          analytics.priorityDistribution.low,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#4BC0C0'],
      },
    ],
  };

  // Burndown chart data
  const burndownData = {
    labels: analytics.timeline.map(day => day.date),
    datasets: [
      {
        label: 'Remaining Tasks',
        data: analytics.timeline.map(day => {
          const remainingTasks = project.tasks.filter(task => 
            new Date(task.dueDate) <= day.date && task.status !== 'completed'
          ).length;
          return remainingTasks;
        }),
        borderColor: '#FF6384',
        tension: 0.1,
      },
      {
        label: 'Ideal Burndown',
        data: analytics.timeline.map((_, index) => {
          const totalTasks = project.tasks.length;
          const days = analytics.timeline.length;
          return Math.max(0, totalTasks - (totalTasks / days) * index);
        }),
        borderColor: '#36A2EB',
        borderDash: [5, 5],
        tension: 0,
      },
    ],
  };

  // Velocity chart data
  const velocityData = {
    labels: analytics.timeline.map(day => day.date),
    datasets: [
      {
        label: 'Completed Tasks',
        data: analytics.timeline.map(day => {
          return project.tasks.filter(task => 
            new Date(task.updatedAt) <= day.date && task.status === 'completed'
          ).length;
        }),
        borderColor: '#4BC0C0',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-4 space-y-6">
      {/* Project Overview */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <div className="text-gray-500">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{project.tasks.length}</div>
            <div className="text-gray-500">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{project.teamMembers.length}</div>
            <div className="text-gray-500">Team Members</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Task Distribution</h3>
          <div className="h-64">
            <Pie data={taskDistributionData} />
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <div className="h-64">
            <Bar data={priorityDistributionData} />
          </div>
        </div>
      </div>

      {/* Burndown Chart */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Burndown Chart</h3>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as 'day' | 'week' | 'month')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
        <div className="h-64">
          <Line
            data={burndownData}
            options={{
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: selectedTimeframe,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Velocity Chart */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Velocity Chart</h3>
        <div className="h-64">
          <Line
            data={velocityData}
            options={{
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: selectedTimeframe,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Team Activity */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Team Activity</h3>
        <div className="space-y-2">
          {analytics.teamMemberActivity.map(member => (
            <div key={member.userId} className="flex justify-between items-center p-2 border rounded">
              <div>
                <div className="font-medium">User {member.userId}</div>
                <div className="text-sm text-gray-500">
                  {member.completedTasks} completed, {member.activeTasks} active
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Last active: {new Date(member.lastActive).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Action Items</h3>
        <div className="space-y-2">
          {actionItems.map(item => (
            <div key={item.id} className="p-2 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.priority === 'high' ? 'bg-red-100 text-red-800' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.priority}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
        <div className="space-y-4">
          {analytics.timeline.map((day, index) => (
            <div key={index} className="border-l-2 pl-4">
              <div className="font-medium mb-2">
                {new Date(day.date).toLocaleDateString()}
              </div>
              <div className="space-y-2">
                {day.events.map(event => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      event.type === 'task' ? 'bg-blue-500' :
                      event.type === 'milestone' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`} />
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 