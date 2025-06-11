"use client"

import { useEffect, useState, useRef } from "react"
import { useDebugStore, type DebugEvent } from "@/lib/stores/debug-store"
import { useDebugTracker } from "@/hooks/use-debug-tracker"
import {
  X,
  Download,
  Trash2,
  Pin,
  PinOff,
  Copy,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
} from "lucide-react"

export function PersistentDebugMonitor() {
  // Use the debug tracker hook to capture events
  useDebugTracker()

  // Get state from debug store
  const {
    events,
    isVisible,
    isPinned,
    isExpanded,
    isEnabled,
    activeFilters,
    clearEvents,
    setVisibility,
    setPinned,
    setExpanded,
    setEnabled,
    toggleFilter,
  } = useDebugStore()

  // Local state
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const eventsContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new events come in
  useEffect(() => {
    if (autoScroll && eventsContainerRef.current && events.length > 0) {
      eventsContainerRef.current.scrollTop = eventsContainerRef.current.scrollHeight
    }
  }, [events, autoScroll])

  // Filter events based on search term and category
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchTerm === "" ||
      event.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === null || event.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Get all unique categories for filtering
  const categories = Array.from(new Set(events.map((event) => event.category)))

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    })
  }

  // Copy event to clipboard
  const copyToClipboard = (event: DebugEvent) => {
    const text = `[${formatTime(event.timestamp)}] [${event.category}] ${event.type}: ${event.message}\n${JSON.stringify(event.data, null, 2)}`
    navigator.clipboard.writeText(text)
  }

  // Export all events as JSON
  const exportEvents = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      events: events,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `auth-debug-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Get icon for event category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Auth":
        return <CheckCircle className="h-4 w-4 text-blue-400" />
      case "Error":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "Warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "Redirect":
        return <RefreshCw className="h-4 w-4 text-orange-400" />
      case "Google":
        return <Info className="h-4 w-4 text-red-400" />
      case "Clerk":
        return <Info className="h-4 w-4 text-purple-400" />
      case "Route":
        return <Info className="h-4 w-4 text-green-400" />
      default:
        return <Info className="h-4 w-4 text-gray-400" />
    }
  }

  // Get border color for event category
  const getCategoryBorderColor = (category: string) => {
    switch (category) {
      case "Auth":
        return "border-l-blue-400"
      case "Error":
        return "border-l-red-400"
      case "Warning":
        return "border-l-yellow-400"
      case "Redirect":
        return "border-l-orange-400"
      case "Google":
        return "border-l-red-400"
      case "Clerk":
        return "border-l-purple-400"
      case "Route":
        return "border-l-green-400"
      default:
        return "border-l-gray-400"
    }
  }

  // If debug monitor is disabled, only show the toggle button
  if (!isEnabled) {
    return (
      <button
        onClick={() => setEnabled(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600"
        title="Enable Debug Monitor"
      >
        <Eye className="h-4 w-4" />
      </button>
    )
  }

  // If debug monitor is not visible, only show the toggle button
  if (!isVisible) {
    return (
      <button
        onClick={() => setVisibility(true)}
        className="fixed bottom-4 right-4 z-[9999] bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600"
        title="Show Debug Monitor"
      >
        <Eye className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div
      className={`fixed z-[9999] bg-black/90 backdrop-blur-lg text-white rounded-lg shadow-2xl border border-white/20 transition-all duration-300 ${
        isPinned ? "top-4 right-4" : "bottom-4 right-4"
      } ${isExpanded ? "w-[700px] h-[80vh]" : "w-[400px] h-[300px]"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-bold text-sm">Auth Debug Monitor</h3>
          <span className="text-xs text-white/60">({filteredEvents.length} events)</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded hover:bg-white/10 ${autoScroll ? "text-green-400" : "text-white/60"}`}
            title={autoScroll ? "Auto-scroll enabled" : "Auto-scroll disabled"}
          >
            {autoScroll ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setPinned(!isPinned)}
            className="p-1 rounded hover:bg-white/10 text-white/70"
            title={isPinned ? "Unpin from top" : "Pin to top"}
          >
            {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-white/10 text-white/70"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button onClick={exportEvents} className="p-1 rounded hover:bg-white/10 text-white/70" title="Export events">
            <Download className="h-4 w-4" />
          </button>

          <button onClick={clearEvents} className="p-1 rounded hover:bg-white/10 text-white/70" title="Clear events">
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setEnabled(false)}
            className="p-1 rounded hover:bg-white/10 text-white/70"
            title="Hide monitor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-white/20 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-white/50" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <select
            value={categoryFilter || ""}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {isExpanded && (
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}
                className={`px-2 py-0.5 rounded text-xs ${
                  categoryFilter === category ? "bg-blue-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Events Container */}
      <div
        ref={eventsContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 text-xs"
        style={{ maxHeight: isExpanded ? "calc(80vh - 120px)" : "200px" }}
      >
        {filteredEvents.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No events to display</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`border-l-2 ${getCategoryBorderColor(event.category)} pl-2 py-1 hover:bg-white/5 rounded-r cursor-pointer group`}
              onClick={() => copyToClipboard(event)}
              title="Click to copy"
            >
              <div className="flex items-start gap-2">
                {getCategoryIcon(event.category)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">[{event.category}]</span>
                    <span className="text-white/70">{event.type}:</span>
                    <span className="text-white/90 truncate">{event.message}</span>
                    <span className="text-white/50 text-xs ml-auto">{formatTime(event.timestamp)}</span>
                    <Copy className="h-3 w-3 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {event.data && (
                    <div className="bg-white/5 rounded p-2 mt-1 overflow-x-auto">
                      <pre className="text-white/80 text-xs whitespace-pre-wrap">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {event.url && isExpanded && (
                    <div className="text-white/50 text-xs mt-1 truncate">URL: {event.url}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 border-t border-white/20 bg-white/5">
        <div className="flex items-center justify-between text-xs">
          <div className="text-white/50">
            {events.length > 0 ? `Latest: ${formatTime(events[0].timestamp)}` : "No events"}
          </div>
          <div className="text-white/50">{window.location.pathname}</div>
        </div>
      </div>
    </div>
  )
}
