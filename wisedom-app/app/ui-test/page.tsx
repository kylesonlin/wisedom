'use client';

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Textarea } from '@/components/ui/Textarea';
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose, ToastAction } from '@/components/ui/Toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';

export default function UITest() {
  const [progress, setProgress] = useState(13);
  const [radioValue, setRadioValue] = useState('default');
  const [toastOpen, setToastOpen] = useState(false);

  // Simulate progress
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">UI Components Test</h1>

      {/* Progress */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Progress</h2>
        <Progress value={progress} className="w-full" />
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges</h2>
        <div className="flex gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge className="bg-green-500 hover:bg-green-600 text-white">Success</Badge>
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Warning</Badge>
        </div>
      </section>

      {/* Input */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Input</h2>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
      </section>

      {/* Radio Group */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Radio Group</h2>
        <RadioGroup value={radioValue} onValueChange={setRadioValue}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default" id="default" />
            <Label htmlFor="default">Default</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="comfortable" id="comfortable" />
            <Label htmlFor="comfortable">Comfortable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="compact" id="compact" />
            <Label htmlFor="compact">Compact</Label>
          </div>
        </RadioGroup>
      </section>

      {/* Textarea */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Textarea</h2>
        <Textarea placeholder="Type your message here." />
      </section>

      {/* Toast */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Toast</h2>
        <ToastProvider>
          <button
            onClick={() => setToastOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Show Toast
          </button>
          <Toast open={toastOpen} onOpenChange={setToastOpen}>
            <ToastTitle>Success!</ToastTitle>
            <ToastDescription>Your action was completed successfully.</ToastDescription>
            <ToastClose />
            <ToastAction altText="Undo">Undo</ToastAction>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      </section>

      {/* Tooltip */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Tooltip</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>
              <p>This is a tooltip</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </section>

      {/* Scroll Area */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Scroll Area</h2>
        <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
          <div className="space-y-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="p-4 bg-gray-100 rounded-md">
                Item {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </section>

      {/* Dropdown Menu */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Dropdown Menu</h2>
        <DropdownMenu>
          <DropdownMenuTrigger className="px-4 py-2 bg-primary text-white rounded-md">
            Open Menu
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>
    </div>
  );
} 