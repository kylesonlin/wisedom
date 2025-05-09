"use client"

import * as React from "react"
import { Check, Plus, Search, Mail, Phone, Star } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { cn } from "@/lib/utils"

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

function useContacts() {
  const [contacts, setContacts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchContacts() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('createdAt', { ascending: false })
        if (error) throw error
        setContacts(data || [])
      } catch (err: any) {
        setError(err.message || 'Failed to fetch contacts')
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
  }, [])

  return { contacts, loading, error }
}

export function ContactsWidget() {
  const { contacts, loading, error } = useContacts()

  if (loading) return <div>Loading contacts...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!contacts.length) return <div>No contacts found.</div>

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Input placeholder="Search contacts..." className="h-8" />
        <Button variant="outline" size="sm" className="shrink-0">
          Filter
        </Button>
      </div>
      <div className="space-y-3 overflow-auto flex-1">
        {contacts.map((contact) => (
          <Card key={contact.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={`${contact.firstName ?? ''} ${contact.lastName ?? ''}`} />
                  <AvatarFallback>{`${contact.firstName?.[0] ?? ''}${contact.lastName?.[0] ?? ''}`}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1 overflow-hidden">
                  <div className="flex items-center">
                    <h4 className="font-medium truncate">{`${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim()}</h4>
                    {contact.favorite && <Star className="ml-1 h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.title} {contact.company ? `at ${contact.company}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{contact.email}</span>
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="h-3 w-3" />
                        <span>{contact.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 