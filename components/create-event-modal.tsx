"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Calendar, Clock, MapPin, Users } from "lucide-react"
import type { CalendarEvent } from "@/lib/google-calendar"

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateEvent: (eventData: Partial<CalendarEvent>) => Promise<void>
}

export function CreateEventModal({ isOpen, onClose, onCreateEvent }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    attendees: "",
  })
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      await onCreateEvent({
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        attendees: formData.attendees
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean),
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        location: "",
        attendees: "",
      })

      onClose()
    } catch (error) {
      console.error("Error creating event:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create New Event
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white">
                Event Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter event title"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime" className="text-white flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Start Time *
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="endTime" className="text-white flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  End Time *
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-white flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter location"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <Label htmlFor="attendees" className="text-white flex items-center gap-1">
                <Users className="h-3 w-3" />
                Attendees
              </Label>
              <Input
                id="attendees"
                value={formData.attendees}
                onChange={(e) => handleInputChange("attendees", e.target.value)}
                placeholder="Enter email addresses, separated by commas"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter event description"
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !formData.title || !formData.startTime || !formData.endTime}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isCreating ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
