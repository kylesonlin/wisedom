"use client"

import { useState } from "react"
import { Bookmark, ExternalLink, Share2, ThumbsUp } from "lucide-react"

import { Button } from "./ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs"
import { Badge } from "./ui/Badge"
import { Separator } from "./ui/Separator"

const newsItems = [
  {
    id: 1,
    title: "AI Innovations Transforming Customer Experience in 2023",
    source: "Tech Insights",
    category: "Technology",
    timestamp: "2 hours ago",
    relevance: "Based on your interest in AI",
    image: "/placeholder.svg?height=60&width=100",
    saved: false,
    liked: false,
  },
  {
    id: 2,
    title: "New Funding Opportunities for Startups in Healthcare",
    source: "Venture Weekly",
    category: "Finance",
    timestamp: "5 hours ago",
    relevance: "Shared by 3 connections",
    image: "/placeholder.svg?height=60&width=100",
    saved: true,
    liked: true,
  },
  {
    id: 3,
    title: "Market Trends: Remote Work Technologies on the Rise",
    source: "Business Today",
    category: "Business",
    timestamp: "Yesterday",
    relevance: "Trending in your network",
    image: "/placeholder.svg?height=60&width=100",
    saved: false,
    liked: false,
  },
  {
    id: 4,
    title: "Sustainability Initiatives Gaining Traction in Tech Industry",
    source: "Green Tech Report",
    category: "Sustainability",
    timestamp: "2 days ago",
    relevance: "Matches your sustainability interest",
    image: "/placeholder.svg?height=60&width=100",
    saved: false,
    liked: false,
  },
]

export function IndustryUpdates() {
  const [news, setNews] = useState(newsItems)

  const toggleSaved = (id: number) => {
    setNews(news.map((item) => (item.id === id ? { ...item, saved: !item.saved } : item)))
  }

  const toggleLiked = (id: number) => {
    setNews(news.map((item) => (item.id === id ? { ...item, liked: !item.liked } : item)))
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="foryou" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="foryou">For You</TabsTrigger>
          <TabsTrigger value="industry">Industry</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>
        <TabsContent value="foryou" className="space-y-4 mt-2">
          {news.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex gap-3">
                <div className="h-[60px] w-[100px] overflow-hidden rounded-md">
                  <img src={item.image || "/placeholder.svg"} alt={item.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{item.source}</span>
                    <span className="mx-1">•</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                      {item.category}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground">{item.relevance}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleLiked(item.id)}>
                    <ThumbsUp className={`h-4 w-4 ${item.liked ? "fill-primary text-primary" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleSaved(item.id)}>
                    <Bookmark className={`h-4 w-4 ${item.saved ? "fill-primary text-primary" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {item.id !== news.length && <Separator className="my-2" />}
            </div>
          ))}
        </TabsContent>
        <TabsContent value="industry">
          <div className="py-8 text-center text-sm text-muted-foreground">Industry-specific news will appear here.</div>
        </TabsContent>
        <TabsContent value="saved">
          {news.filter((item) => item.saved).length > 0 ? (
            <div className="space-y-4 mt-2">
              {news
                .filter((item) => item.saved)
                .map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex gap-3">
                      <div className="h-[60px] w-[100px] overflow-hidden rounded-md">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span>{item.source}</span>
                          <span className="mx-1">•</span>
                          <span>{item.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleLiked(item.id)}>
                          <ThumbsUp className={`h-4 w-4 ${item.liked ? "fill-primary text-primary" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleSaved(item.id)}>
                          <Bookmark className={`h-4 w-4 fill-primary text-primary`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {item.id !== news.filter((i) => i.saved).slice(-1)[0].id && <Separator className="my-2" />}
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No saved articles yet. Bookmark articles to save them for later.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 