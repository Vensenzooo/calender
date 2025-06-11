"use client"

import { useAuth, useUser } from "@clerk/nextjs"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { debugLogger, type LogEntry } from "@/lib/debug-logger"
import {
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Search,
  Copy,
} from "lucide-react"

export function AdvancedRedirectMonitor() {
  const { isLoaded, isSignedIn, userId, sessionId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [filter, setFilter] = useState<string>("")
  const [levelFilter, setLevelFilter] = useState<LogEntry["level"] | "all">("all")
  const [autoScroll, setAutoScroll] = useState(true)

  const logsContainerRef = useRef<HTMLDivElement>(null)
  const mountTimeRef = useRef(Date.now())

  // Subscribe to debug logger
  useEffect(() => {
    const unsubscribe = debugLogger.subscribe(setLogs)
    return unsubscribe
  }, [])

  // Log component mount
  useEffect(() => {
    debugLogger.info("RedirectMonitor", "Component mounted", {
      pathname,
      searchParams: searchParams.toString(),
      isLoaded,
      isSignedIn,
      userId,
      sessionId,
      mountTime: mountTimeRef.current,
    })
  }, [])

  // Log auth state changes
  useEffect(() => {
    if (isLoaded) {
      debugLogger.info("Auth", "Clerk loaded", {
        isSignedIn,
        userId,
        sessionId,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        userFirstName: user?.firstName,
        userLastName: user?.lastName,
        externalAccounts: user?.externalAccounts?.map((acc) => ({
          provider: acc.provider,
          emailAddress: acc.emailAddress,
        })),
      })

      // Check for Google account
      const googleAccount = user?.externalAccounts?.find((acc) => acc.provider === "google")
      if (googleAccount) {
        debugLogger.success("Google", "Google account detected", {
          emailAddress: googleAccount.emailAddress,
          provider: googleAccount.provider,
        })
      } else if (isSignedIn) {
        debugLogger.warn("Google", "No Google account found", {
          availableProviders: user?.externalAccounts?.map((acc) => acc.provider) || [],
        })
      }
    }
  }, [isLoaded, isSignedIn, userId, sessionId, user])

  // Log route changes
  useEffect(() => {
    debugLogger.info("Navigation", "Route changed", {
      pathname,
      searchParams: searchParams.toString(),
      fullUrl: typeof window !== "undefined" ? window.location.href : undefined,
    })

    // Check for redirect parameters
    const redirectUrl = searchParams.get("redirect_url")
    if (redirectUrl) {
      debugLogger.warn("Navigation", "Redirect URL parameter detected", {
        redirectUrl,
        isAbsolute: redirectUrl.startsWith("http"),
      })
    }
  }, [pathname, searchParams])

  // Log Google Calendar connection attempts
  useEffect(() => {
    const checkGoogleCalendarAccess = async () => {
      if (isSignedIn && user) {
        try {
          debugLogger.info("GoogleCalendar", "Checking calendar access", {
            userId,
            userMetadata: user.publicMetadata,
          })

          const response = await fetch("/api/calendar/events")
          const data = await response.json()

          if (response.ok) {
            debugLogger.success("GoogleCalendar", "Calendar access successful", {
              eventsCount: data.events?.length || 0,
              isDemo: data.isDemo,
              connected: data.connected,
            })
          } else {
            debugLogger.error("GoogleCalendar", "Calendar access failed", {
              status: response.status,
              error: data.error,
              needsConnection: data.needsConnection,
            })
          }
        } catch (error) {
          debugLogger.error("GoogleCalendar", "Calendar check error", {
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }
    }

    if (isLoaded && isSignedIn) {
      checkGoogleCalendarAccess()
    }
  }, [isLoaded, isSignedIn, user, userId])

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      filter === "" ||
      log.message.toLowerCase().includes(filter.toLowerCase()) ||
      log.category.toLowerCase().includes(filter.toLowerCase())

    const matchesLevel = levelFilter === "all" || log.level === levelFilter

    return matchesFilter && matchesLevel
  })

  const getLogIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      default:
        return <Info className="h-4 w-4 text-blue-400" />
    }
  }

  const getLogBorderColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "border-l-green-400"
      case "error":
        return "border-l-red-400"
      case "warn":
        return "border-l-yellow-400"
      default:
        return "border-l-blue-400"
    }
  }

  const copyLogToClipboard = (log: LogEntry) => {
    const logText = `[${log.timestamp}] [${log.category}] ${log.message}\n${JSON.stringify(log.data, null, 2)}`
    navigator.clipboard.writeText(logText)
    debugLogger.success("Debug", "Log copied to clipboard", { logId: log.id })
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("fr-FR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    })
  }

  // Show monitor in development or when there are issues
  const shouldShow =
    process.env.NODE_ENV === "development" ||
    searchParams.has("redirect_url") ||
    logs.some((log) => log.level === "error" || log.level === "warn")

  if (!shouldShow && !isVisible) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 bg-black/90 backdrop-blur-lg text-white rounded-lg shadow-2xl border border-white/20 transition-all duration-300 ${
        isExpanded ? "w-[600px] h-[80vh]" : "w-[400px] h-[300px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-bold text-sm">Debug Monitor</h3>
          <span className="text-xs text-white/60">({filteredLogs.length} logs)</span>
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
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-white/10 text-white/70"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <button
            onClick={debugLogger.exportLogs}
            className="p-1 rounded hover:bg-white/10 text-white/70"
            title="Export logs"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={debugLogger.clearLogs}
            className="p-1 rounded hover:bg-white/10 text-white/70"
            title="Clear logs"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 rounded hover:bg-white/10 text-white/70"
            title="Hide monitor"
          >
            ×
          </button>
        </div>
      </div>

      {/* Filters */}
      {isExpanded && (
        <div className="p-3 border-b border-white/20 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-white/50" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-7 pr-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LogEntry["level"] | "all")}
              className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="all">All</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      )}

      {/* Logs Container */}
      <div
        ref={logsContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 text-xs"
        style={{ maxHeight: isExpanded ? "calc(80vh - 120px)" : "240px" }}
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No logs match your filters</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`border-l-2 ${getLogBorderColor(log.level)} pl-2 py-1 hover:bg-white/5 rounded-r cursor-pointer group`}
              onClick={() => copyLogToClipboard(log)}
              title="Click to copy"
            >
              <div className="flex items-start gap-2">
                {getLogIcon(log.level)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white">[{log.category}]</span>
                    <span className="text-white/70">{log.message}</span>
                    <span className="text-white/50 text-xs ml-auto">{formatTimestamp(log.timestamp)}</span>
                    <Copy className="h-3 w-3 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {log.data && (
                    <div className="bg-white/5 rounded p-2 mt-1 overflow-x-auto">
                      <pre className="text-white/80 text-xs whitespace-pre-wrap">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {log.url && isExpanded && <div className="text-white/50 text-xs mt-1 truncate">URL: {log.url}</div>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 py-2 border-t border-white/20 bg-white/5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1 ${isLoaded ? "text-green-400" : "text-yellow-400"}`}>
              <div className={`w-2 h-2 rounded-full ${isLoaded ? "bg-green-400" : "bg-yellow-400"}`}></div>
              Clerk: {isLoaded ? "Loaded" : "Loading"}
            </span>

            <span className={`flex items-center gap-1 ${isSignedIn ? "text-green-400" : "text-red-400"}`}>
              <div className={`w-2 h-2 rounded-full ${isSignedIn ? "bg-green-400" : "bg-red-400"}`}></div>
              Auth: {isSignedIn ? "Signed In" : "Not Signed In"}
            </span>
          </div>

          <div className="text-white/50">{pathname}</div>
        </div>
      </div>
    </div>
  )
}
