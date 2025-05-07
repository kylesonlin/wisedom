import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Ucard"
import { Button } from "@/components/ui/Ubutton"
import { Input } from "@/components/ui/Uinput"
import { Bell, Search, Settings } from "lucide-react"

export function WelcomeWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back, User!</CardTitle>
        <CardDescription>Here's what's happening today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8" />
          </div>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">View Profile</Button>
        <Button>Get Started</Button>
      </CardFooter>
    </Card>
  )
} 