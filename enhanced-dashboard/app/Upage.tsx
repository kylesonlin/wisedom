"use client"

import * as React from "react"
import { useState } from "react"
import { Bell, Menu, Plus, Search, Settings, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Uavatar"
import { Button } from "../components/ui/Ubutton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Ucard"
import { Input } from "../components/ui/Uinput"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Utabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/Udropdown-menu"

import { DashboardSidebar, SidebarProvider } from "./components/Udashboardsidebar"
import { IndustryUpdates } from "./components/Uindustryupdates"
import { UpcomingEvents } from "./components/Uupcomingevents"
import { SuggestedTasks } from "./components/Usuggestedtasks"
import { WelcomeWidget } from "./components/Uwelcomewidget"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
            <div className="w-full flex-1">
              <form>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                  />
                </div>
              </form>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    3
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-auto">
                  {[1, 2, 3].map((i) => (
                    <DropdownMenuItem key={i} className="cursor-pointer p-0">
                      <a href="#" className="flex w-full items-start gap-2 p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">New connection request from User {i}</p>
                          <p className="text-xs text-muted-foreground">5 min ago</p>
                        </div>
                      </a>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer justify-center">
                  <a href="#" className="justify-center">
                    View all notifications
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-5 w-5" />
                  <span className="sr-only">Add</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Add New</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <span>Contact</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Task</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Event</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Note</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Appearance</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Integrations</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 space-y-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <WelcomeWidget />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Industry Updates Widget */}
                    <Card className="col-span-1 md:col-span-1 lg:col-span-1">
                      <CardHeader>
                        <CardTitle>Industry Updates</CardTitle>
                        <CardDescription>Latest news and updates from your industry</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <IndustryUpdates />
                      </CardContent>
                    </Card>

                    {/* Upcoming Events Widget */}
                    <Card className="col-span-1 md:col-span-1 lg:col-span-1">
                      <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                        <CardDescription>Birthdays, anniversaries, and important dates</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <UpcomingEvents />
                      </CardContent>
                    </Card>

                    {/* Suggested Tasks Widget */}
                    <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                      <CardHeader>
                        <CardTitle>Suggested Tasks</CardTitle>
                        <CardDescription>Recommended follow-ups and actions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <SuggestedTasks />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics</CardTitle>
                      <CardDescription>View detailed analytics about your network and activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Analytics content will appear here.</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reports</CardTitle>
                      <CardDescription>Generate and view reports about your activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Reports content will appear here.</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dashboard Settings</CardTitle>
                      <CardDescription>Customize your dashboard experience.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Settings content will appear here.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
