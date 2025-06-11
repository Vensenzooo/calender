"use client"

import { useState, useEffect } from "react"
import { useUser, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import { useCalendar } from "@/hooks/use-calendar"
import { useGoogleOAuthMonitor } from "@/hooks/use-google-oauth-monitor"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Menu,
  Clock,
  MapPin,
  Users,
  Calendar,
  Pause,
  Sparkles,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import { GoogleCalendarConnect } from "@/components/google-calendar-connect"
import { CreateEventModal } from "@/components/create-event-modal"
import { AuthGuard } from "@/components/auth-guard"
import type { CalendarEvent } from "@/lib/google-calendar"
import { useAuthDebug } from "@/hooks/use-auth-debug"
// Ajouter les imports pour les nouveaux composants de monitoring
import { AdvancedRedirectMonitor } from "@/components/advanced-redirect-monitor"
import { GoogleCalendarDiagnostics } from "@/components/google-calendar-diagnostics"
// import { RedirectMonitor } from "@/components/redirect-monitor"
// import { RedirectTestPanel } from "@/components/redirect-test-panel"

function DashboardPage() {
  useGoogleOAuthMonitor()
  const { user, isLoaded } = useUser()
  const { events, loading, error, needsConnection, refetch, createEvent } = useCalendar()
  const { auth } = useAuthDebug()

  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentView, setCurrentView] = useState("week")
  const [currentMonth, setCurrentMonth] = useState("June 2025")
  const [currentDate, setCurrentDate] = useState("June 10")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      console.log("Dashboard: User loaded successfully", {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
      })
      setIsPageLoaded(true)

      // Show AI popup after 3 seconds, but only if we have calendar access
      if (!needsConnection) {
        const popupTimer = setTimeout(() => {
          setShowAIPopup(true)
        }, 3000)

        return () => clearTimeout(popupTimer)
      }
    }
  }, [isLoaded, user, needsConnection])

  useEffect(() => {
    if (showAIPopup && !needsConnection) {
      const text =
        events.length < 3
          ? "Looks like you don't have that many meetings today. Shall I play some Hans Zimmer essentials to help you get into your Flow State?"
          : "You have a busy day ahead! Would you like me to help you prepare for your upcoming meetings?"

      let i = 0
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup, events.length, needsConnection])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
  }

  const handleRefresh = async () => {
    await refetch()
  }

  const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
    await createEvent(eventData)
  }

  const handleConnectCalendar = () => {
    // Refresh events after connection attempt
    setTimeout(() => {
      refetch()
    }, 2000)
  }

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80 // 80px per hour
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  // Sample calendar for mini calendar
  const daysInMonth = 30
  const firstDayOffset = 6 // Saturday is the first day of the month in this example
  const miniCalendarDays = Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
    i < firstDayOffset ? null : i - firstDayOffset + 1,
  )

  // Sample my calendars
  const myCalendars = [
    { name: "My Calendar", color: "bg-blue-500" },
    { name: "Work", color: "bg-green-500" },
    { name: "Personal", color: "bg-purple-500" },
    { name: "Family", color: "bg-orange-500" },
  ]

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const weekDates = [8, 9, 10, 11, 12, 13, 14]
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8) // 8 AM to 4 PM

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AdvancedRedirectMonitor />
      <GoogleCalendarDiagnostics />

      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Navigation */}
      <header
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 opacity-0 ${isPageLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <Menu className="h-6 w-6 text-white" />
          <span className="text-2xl font-semibold text-white drop-shadow-lg">Calendar</span>
          {loading && <RefreshCw className="h-4 w-4 text-white animate-spin" />}
          {needsConnection && (
            <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm">Connect Google Calendar</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Search"
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <button onClick={handleRefresh} className="p-2 rounded-full hover:bg-white/10">
            <RefreshCw className={`h-5 w-5 text-white ${loading ? "animate-spin" : ""}`} />
          </button>
          <Settings className="h-6 w-6 text-white drop-shadow-md" />
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-10 w-10",
              },
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Sidebar */}
        <div
          className={`w-64 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isPageLoaded ? "animate-fade-in" : ""} flex flex-col justify-between`}
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={needsConnection}
              className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
              <span>Create Event</span>
            </button>

            {/* Mini Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">{currentMonth}</h3>
                <div className="flex gap-1">
                  <button className="p-1 rounded-full hover:bg-white/20">
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </button>
                  <button className="p-1 rounded-full hover:bg-white/20">
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-xs text-white/70 font-medium py-1">
                    {day}
                  </div>
                ))}

                {miniCalendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                      day === 10 ? "bg-blue-500 text-white" : "text-white hover:bg-white/20"
                    } ${!day ? "invisible" : ""}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* My Calendars */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">My calendars</h3>
              <div className="space-y-2">
                {myCalendars.map((cal, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${cal.color}`}></div>
                    <span className="text-white text-sm">{cal.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Calendar Connection */}
            <GoogleCalendarConnect needsConnection={needsConnection} onConnect={handleConnectCalendar} />
          </div>
        </div>

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isPageLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-white bg-blue-500 rounded-md">Today</button>
              <div className="flex">
                <button className="p-2 text-white hover:bg-white/10 rounded-l-md">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="p-2 text-white hover:bg-white/10 rounded-r-md">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-white">{currentDate}</h2>
            </div>

            <div className="flex items-center gap-2 rounded-md p-1">
              <button
                onClick={() => setCurrentView("day")}
                className={`px-3 py-1 rounded ${currentView === "day" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Day
              </button>
              <button
                onClick={() => setCurrentView("week")}
                className={`px-3 py-1 rounded ${currentView === "week" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView("month")}
                className={`px-3 py-1 rounded ${currentView === "month" ? "bg-white/20" : ""} text-white text-sm`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Week View */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl h-full">
              {/* Error State */}
              {error && (
                <div className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">Error Loading Calendar</h3>
                  <p className="text-white/70 mb-4">{error}</p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Loading State */}
              {loading && !error && (
                <div className="p-8 text-center">
                  <RefreshCw className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">Loading Calendar</h3>
                  <p className="text-white/70">Fetching your events from Google Calendar...</p>
                </div>
              )}

              {/* Calendar Grid */}
              {!loading && !error && (
                <>
                  {/* Week Header */}
                  <div className="grid grid-cols-8 border-b border-white/20">
                    <div className="p-2 text-center text-white/50 text-xs"></div>
                    {weekDays.map((day, i) => (
                      <div key={i} className="p-2 text-center border-l border-white/20">
                        <div className="text-xs text-white/70 font-medium">{day}</div>
                        <div
                          className={`text-lg font-medium mt-1 text-white ${weekDates[i] === 10 ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}
                        >
                          {weekDates[i]}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time Grid */}
                  <div className="grid grid-cols-8">
                    {/* Time Labels */}
                    <div className="text-white/70">
                      {timeSlots.map((time, i) => (
                        <div key={i} className="h-20 border-b border-white/10 pr-2 text-right text-xs">
                          {time > 12 ? `${time - 12} PM` : `${time} AM`}
                        </div>
                      ))}
                    </div>

                    {/* Days Columns */}
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <div key={dayIndex} className="border-l border-white/20 relative">
                        {timeSlots.map((_, timeIndex) => (
                          <div key={timeIndex} className="h-20 border-b border-white/10"></div>
                        ))}

                        {/* Real Google Calendar Events */}
                        {events
                          .filter((event) => event.day === dayIndex + 1)
                          .map((event, i) => {
                            const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                            return (
                              <div
                                key={i}
                                className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                                style={{
                                  ...eventStyle,
                                  left: "4px",
                                  right: "4px",
                                }}
                                onClick={() => handleEventClick(event)}
                              >
                                <div className="font-medium">{event.title}</div>
                                <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                                {event.location && <div className="opacity-70 text-[10px]">{event.location}</div>}
                              </div>
                            )
                          })}
                      </div>
                    ))}
                  </div>

                  {/* Empty State */}
                  {!needsConnection && events.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Calendar className="h-16 w-16 text-white/30 mx-auto mb-4" />
                        <h3 className="text-white text-lg font-medium mb-2">No Events This Week</h3>
                        <p className="text-white/70 mb-4">Your calendar is clear. Time to plan something!</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Create Your First Event
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* AI Popup */}
        {showAIPopup && !needsConnection && (
          <div className="fixed bottom-8 right-8 z-20">
            <div className="w-[450px] relative bg-gradient-to-br from-blue-400/30 via-blue-500/30 to-blue-600/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-blue-300/30 text-white">
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </div>
                <div className="min-h-[80px]">
                  <p className="text-base font-light">{typedText}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={togglePlay}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowAIPopup(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  No
                </button>
              </div>
              {isPlaying && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white text-sm hover:bg-white/20 transition-colors"
                    onClick={togglePlay}
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause Hans Zimmer</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${selectedEvent.color} p-6 rounded-lg shadow-xl max-w-md w-full mx-4`}>
              <h3 className="text-2xl font-bold mb-4 text-white">{selectedEvent.title}</h3>
              <div className="space-y-3 text-white">
                <p className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {selectedEvent.allDay ? "All Day" : `${selectedEvent.startTime} - ${selectedEvent.endTime}`}
                </p>
                {selectedEvent.location && (
                  <p className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    {selectedEvent.location}
                  </p>
                )}
                <p className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  {`${weekDays[selectedEvent.day - 1]}, ${weekDates[selectedEvent.day - 1]} ${currentMonth}`}
                </p>
                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <p className="flex items-start">
                    <Users className="mr-2 h-5 w-5 mt-1" />
                    <span>
                      <strong>Attendees:</strong>
                      <br />
                      {selectedEvent.attendees.join(", ")}
                    </span>
                  </p>
                )}
                {selectedEvent.organizer && (
                  <p>
                    <strong>Organizer:</strong> {selectedEvent.organizer}
                  </p>
                )}
                {selectedEvent.description && (
                  <p>
                    <strong>Description:</strong> {selectedEvent.description}
                  </p>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Event Modal */}
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateEvent={handleCreateEvent}
        />
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardPage />
    </AuthGuard>
  )
}
