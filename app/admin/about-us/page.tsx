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
import { Loader2, Plus, Trash } from "lucide-react"

export default function AboutUsPage() {
  const [aboutUs, setAboutUs] = useState<any>({
    title: "",
    content: "",
    mission: "",
    vision: "",
    team_members: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAboutUs()
  }, [])

  const fetchAboutUs = async () => {
    try {
      const { data, error } = await supabase.from("about_us").select("*").single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        // Parse team_members if it's a string
        let teamMembers = data.team_members
        if (typeof teamMembers === "string") {
          teamMembers = JSON.parse(teamMembers)
        }

        setAboutUs({
          ...data,
          team_members: teamMembers || [],
        })
      }
    } catch (error) {
      console.error("Error fetching about us:", error)
      toast({
        title: "Error",
        description: "Failed to load about us content",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAboutUs({ ...aboutUs, [name]: value })
  }

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    const updatedTeamMembers = [...aboutUs.team_members]
    updatedTeamMembers[index] = {
      ...updatedTeamMembers[index],
      [field]: value,
    }
    setAboutUs({ ...aboutUs, team_members: updatedTeamMembers })
  }

  const addTeamMember = () => {
    setAboutUs({
      ...aboutUs,
      team_members: [...aboutUs.team_members, { name: "", position: "", bio: "" }],
    })
  }

  const removeTeamMember = (index: number) => {
    const updatedTeamMembers = [...aboutUs.team_members]
    updatedTeamMembers.splice(index, 1)
    setAboutUs({ ...aboutUs, team_members: updatedTeamMembers })
  }

  const saveAboutUs = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from("about_us").upsert({
        ...aboutUs,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Saved",
        description: "About us content has been updated",
      })
    } catch (error) {
      console.error("Error saving about us:", error)
      toast({
        title: "Error",
        description: "Failed to save about us content",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
        <h2 className="text-3xl font-bold tracking-tight">About Us</h2>
        <Button onClick={saveAboutUs} disabled={saving}>
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
          <TabsTrigger value="mission">Mission & Vision</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About Us Content</CardTitle>
              <CardDescription>Edit the main content for your About Us page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input id="title" name="title" value={aboutUs.title} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content
                </label>
                <Textarea id="content" name="content" value={aboutUs.content} onChange={handleInputChange} rows={10} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mission & Vision</CardTitle>
              <CardDescription>Define your company's mission and vision</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="mission" className="text-sm font-medium">
                  Mission
                </label>
                <Textarea id="mission" name="mission" value={aboutUs.mission} onChange={handleInputChange} rows={4} />
              </div>
              <div className="space-y-2">
                <label htmlFor="vision" className="text-sm font-medium">
                  Vision
                </label>
                <Textarea id="vision" name="vision" value={aboutUs.vision} onChange={handleInputChange} rows={4} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Add or edit team members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {aboutUs.team_members.map((member: any, index: number) => (
                <div key={index} className="space-y-4 border p-4 rounded-md relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 text-red-500"
                    onClick={() => removeTeamMember(index)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={member.name}
                      onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Position</label>
                    <Input
                      value={member.position}
                      onChange={(e) => handleTeamMemberChange(index, "position", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      value={member.bio}
                      onChange={(e) => handleTeamMemberChange(index, "bio", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              <Button onClick={addTeamMember} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

