"use client"

import type React from "react"

import { Bell, ChevronDown, LogOut, Menu, MessageSquare, Plus, Settings, User } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar/index"
import { Button } from "@/components/ui/Button/index"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/DropdownMenu/index"
import { Input } from "@/components/ui/Input/index"

import { useSidebar } from "./DashboardSidebar"

interface DashboardHeaderProps {
  onToggleWidget: (widgetId: string) => void
  visibleWidgets: Record<string, boolean>
  onOpenFeedback: () => void
}

export function DashboardHeader({ onToggleWidget, visibleWidgets, onOpenFeedback }: DashboardHeaderProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white shadow-dashboard px-4 md:px-6">
      <Button variant="outline" size="icon" className="md:hidden" onClick={toggleSidebar}>
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
          <Button variant="outline" size="icon" className="relative hover:bg-dashboard-primary hover:text-white">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-dashboard-primary text-[10px] text-white">
              5
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-[300px] overflow-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <DropdownMenuItem key={i} className="cursor-pointer p-0">
                <Link href="#" className="flex w-full items-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">New message from User {i}</p>
                    <p className="text-xs text-muted-foreground">2 min ago</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer justify-center">
            <Link href="#" className="justify-center">
              View all notifications
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="hover:bg-dashboard-primary hover:text-white">
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
              <span>Project</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="hover:bg-dashboard-primary hover:text-white">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Widgets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {visibleWidgets && (
              <>
                <DropdownMenuItem onClick={() => onToggleWidget("network")}>
                  <span>Network Overview {visibleWidgets.network ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleWidget("projects")}>
                  <span>Project Progress {visibleWidgets.projects ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleWidget("ai-insights")}>
                  <span>AI Insights {visibleWidgets["ai-insights"] ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleWidget("contacts")}>
                  <span>Key Contacts {visibleWidgets.contacts ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleWidget("tasks")}>
                  <span>Tasks {visibleWidgets.tasks ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleWidget("events")}>
                  <span>Events {visibleWidgets.events ? "✓" : ""}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleWidget("activity")}>
                  <span>Activity {visibleWidgets.activity ? "✓" : ""}</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onOpenFeedback}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Send Feedback</span>
          </DropdownMenuItem>
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
  )
}

function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
} 