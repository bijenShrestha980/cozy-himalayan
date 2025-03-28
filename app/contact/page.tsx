"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Loader2 } from "lucide-react"

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch contact info
  useState(() => {
    const fetchContactInfo = async () => {
      try {
        const { data, error } = await supabase.from("contact_us").select("*").single()

        if (error) throw error

        // Parse social media if needed
        let socialMedia = data.social_media
        if (typeof socialMedia === "string") {
          socialMedia = JSON.parse(socialMedia)
        }

        setContactInfo({
          ...data,
          social_media: socialMedia || [],
        })
      } catch (error) {
        console.error("Error fetching contact info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContactInfo()
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        throw new Error("Please fill in all fields")
      }

      // Submit form
      const { error } = await supabase.from("contact_messages").insert([
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: "unread",
        },
      ])

      if (error) throw error

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })

      toast({
        title: "Message sent",
        description: "Thank you for your message. We'll get back to you soon.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Social media icon mapping
  const getSocialIcon = (platform: string) => {
    const lowerPlatform = platform.toLowerCase()
    if (lowerPlatform.includes("facebook")) return <Facebook className="h-5 w-5" />
    if (lowerPlatform.includes("twitter")) return <Twitter className="h-5 w-5" />
    if (lowerPlatform.includes("instagram")) return <Instagram className="h-5 w-5" />
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">{contactInfo?.title || "Contact Us"}</h1>

      <div className="max-w-4xl mx-auto mb-12">
        <p className="text-lg text-center mb-8">
          {contactInfo?.content ||
            "We'd love to hear from you! Please fill out the form below or use our contact information to get in touch."}
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Your Name
                  </label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Your Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo?.email && (
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}

                {contactInfo?.phone && (
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <a href={`tel:${contactInfo.phone}`} className="text-primary hover:underline">
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}

                {contactInfo?.address && (
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="whitespace-pre-line">{contactInfo.address}</p>
                    </div>
                  </div>
                )}

                {contactInfo?.social_media && contactInfo.social_media.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-medium mb-4">Follow Us</h3>
                    <div className="flex space-x-4">
                      {contactInfo.social_media.map((social: any, index: number) => (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary/10 p-3 rounded-full hover:bg-primary/20 transition-colors"
                        >
                          {getSocialIcon(social.platform)}
                          <span className="sr-only">{social.platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {contactInfo?.map_url && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Find Us</h2>
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden border">
            <iframe
              src={contactInfo.map_url}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  )
}

