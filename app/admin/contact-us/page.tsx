"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash, Eye } from "lucide-react"

export default function ContactUsPage() {
  const [contactUs, setContactUs] = useState<any>({
    title: "",
    content: "",
    email: "",
    phone: "",
    address: "",
    map_url: "",
    social_media: [],
  })
  const [messages, setMessages] = useState<any[]>([])
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchContactUs()
    fetchMessages()
  }, [])

  const fetchContactUs = async () => {
    try {
      const { data, error } = await supabase.from("contact_us").select("*").single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        // Parse social_media if it's a string
        let socialMedia = data.social_media
        if (typeof socialMedia === "string") {
          socialMedia = JSON.parse(socialMedia)
        }

        setContactUs({
          ...data,
          social_media: socialMedia || [],
        })
      }
    } catch (error) {
      console.error("Error fetching contact us:", error)
      toast({
        title: "Error",
        description: "Failed to load contact us content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load contact messages",
        variant: "destructive",
      })
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactUs({ ...contactUs, [name]: value })
  }

  const handleSocialMediaChange = (index: number, field: string, value: string) => {
    const updatedSocialMedia = [...contactUs.social_media]
    updatedSocialMedia[index] = {
      ...updatedSocialMedia[index],
      [field]: value,
    }
    setContactUs({ ...contactUs, social_media: updatedSocialMedia })
  }

  const addSocialMedia = () => {
    setContactUs({
      ...contactUs,
      social_media: [...contactUs.social_media, { platform: "", url: "" }],
    })
  }

  const removeSocialMedia = (index: number) => {
    const updatedSocialMedia = [...contactUs.social_media]
    updatedSocialMedia.splice(index, 1)
    setContactUs({ ...contactUs, social_media: updatedSocialMedia })
  }

  const saveContactUs = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from("contact_us").upsert({
        ...contactUs,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Saved",
        description: "Contact us content has been updated",
      })
    } catch (error) {
      console.error("Error saving contact us:", error)
      toast({
        title: "Error",
        description: "Failed to save contact us content",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const viewMessage = (message: any) => {
    setSelectedMessage(message)

    // If message is unread, mark it as read
    if (message.status === "unread") {
      updateMessageStatus(message.id, "read")
    }
  }

  const updateMessageStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id)

      if (error) throw error

      // Update local state
      setMessages(messages.map((msg) => (msg.id === id ? { ...msg, status } : msg)))

      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status })
      }
    } catch (error) {
      console.error("Error updating message status:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Contact Us</h2>
        <Button onClick={saveContactUs} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Us Content</CardTitle>
              <CardDescription>Edit the main content for your Contact Us page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input id="title" name="title" value={contactUs.title} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea id="content" name="content" value={contactUs.content} onChange={handleInputChange} rows={6} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Edit your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="email" name="email" value={contactUs.email} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input id="phone" name="phone" value={contactUs.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>
                <Textarea id="address" name="address" value={contactUs.address} onChange={handleInputChange} rows={3} />
              </div>
              <div className="space-y-2">
                <label htmlFor="map_url" className="text-sm font-medium">
                  Google Maps URL
                </label>
                <Input
                  id="map_url"
                  name="map_url"
                  value={contactUs.map_url}
                  onChange={handleInputChange}
                  placeholder="https://www.google.com/maps/embed?..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Add or edit social media links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactUs.social_media.map((social: any, index: number) => (
                <div key={index} className="space-y-4 border p-4 rounded-md relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 text-red-500"
                    onClick={() => removeSocialMedia(index)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform</label>
                    <Input
                      value={social.platform}
                      onChange={(e) => handleSocialMediaChange(index, "platform", e.target.value)}
                      placeholder="Facebook, Twitter, Instagram, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL</label>
                    <Input
                      value={social.url}
                      onChange={(e) => handleSocialMediaChange(index, "url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ))}
              <Button onClick={addSocialMedia} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Social Media
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
              <CardDescription>View and manage messages from customers</CardDescription>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No messages yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>{formatDate(message.created_at)}</TableCell>
                        <TableCell>{message.name}</TableCell>
                        <TableCell>{message.subject}</TableCell>
                        <TableCell>
                          <Badge variant={message.status === "unread" ? "default" : "outline"}>
                            {message.status === "unread" ? "Unread" : "Read"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => viewMessage(message)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.name} ({selectedMessage?.email})
              <br />
              Date: {selectedMessage && formatDate(selectedMessage.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md bg-muted/50 max-h-[300px] overflow-y-auto">
            <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                updateMessageStatus(selectedMessage.id, selectedMessage.status === "unread" ? "read" : "unread")
              }
            >
              Mark as {selectedMessage?.status === "unread" ? "Read" : "Unread"}
            </Button>
            <Button onClick={() => setSelectedMessage(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

