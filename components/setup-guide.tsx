"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, CheckCircle, Circle } from "lucide-react"

export function SetupGuide() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps((prev) => (prev.includes(stepIndex) ? prev.filter((i) => i !== stepIndex) : [...prev, stepIndex]))
  }

  const steps = [
    {
      title: "Create Google Cloud Project",
      description: "Go to Google Cloud Console and create a new project",
      link: "https://console.cloud.google.com/",
    },
    {
      title: "Enable Google Calendar API",
      description: "Enable the Google Calendar API for your project",
      link: "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com",
    },
    {
      title: "Create OAuth 2.0 Credentials",
      description: "Create OAuth 2.0 client credentials in the Google Cloud Console",
      link: "https://console.cloud.google.com/apis/credentials",
    },
    {
      title: "Configure Clerk Integration",
      description: "Add Google OAuth provider in your Clerk dashboard",
      link: "https://dashboard.clerk.com/",
    },
    {
      title: "Add Environment Variables",
      description: "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment",
    },
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Google Calendar Setup Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
            <button onClick={() => toggleStep(index)} className="mt-1 text-white hover:text-blue-300 transition-colors">
              {completedSteps.includes(index) ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1">
              <h3 className="text-white font-medium">{step.title}</h3>
              <p className="text-white/70 text-sm mt-1">{step.description}</p>
              {step.link && (
                <Button variant="ghost" size="sm" className="mt-2 text-blue-300 hover:text-blue-200 p-0 h-auto" asChild>
                  <a href={step.link} target="_blank" rel="noopener noreferrer">
                    Open in new tab <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
          <h4 className="text-white font-medium mb-2">Environment Variables Needed:</h4>
          <div className="space-y-1 text-sm font-mono text-white/80">
            <div>GOOGLE_CLIENT_ID=your_google_client_id</div>
            <div>GOOGLE_CLIENT_SECRET=your_google_client_secret</div>
            <div>GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
