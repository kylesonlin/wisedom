"use client"

import * as React from "react"
import { ArrowRight, Calendar, CheckCircle2, Clock, Users } from "lucide-react"

import { Button } from "../../components/ui/Ubutton"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/Ucard"

export function WelcomeWidget() {
  return (
    <Card className="col-span-2 md:col-span-2 lg:col-span-4">
      <CardHeader className="pb-2">
        <CardTitle>Welcome back, Jordan!</CardTitle>
        <CardDescription>Here's what's happening in your network today.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">248</p>
              <p className="text-xs text-muted-foreground">Total Connections</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">2 Events</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">3 Tasks</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">4 Updates</p>
              <p className="text-xs text-muted-foreground">Since yesterday</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full justify-between" asChild>
          <a href="#">
            <span>View your activity summary</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
