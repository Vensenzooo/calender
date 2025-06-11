export interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warn" | "error" | "success"
  category: string
  message: string
  data?: any
  url?: string
  userAgent?: string
}

class DebugLogger {
  private logs: LogEntry[] = []
  private maxLogs = 100
  private listeners: ((logs: LogEntry[]) => void)[] = []

  log(level: LogEntry["level"], category: string, message: string, data?: any) {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    }

    this.logs.unshift(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Console log with styling
    const style = this.getConsoleStyle(level)
    console.log(`%c[${category}] ${message}`, style, data || "")

    // Notify listeners
    this.listeners.forEach((listener) => listener([...this.logs]))
  }

  private getConsoleStyle(level: LogEntry["level"]): string {
    const styles = {
      info: "color: #3b82f6; font-weight: bold",
      warn: "color: #f59e0b; font-weight: bold",
      error: "color: #ef4444; font-weight: bold",
      success: "color: #10b981; font-weight: bold",
    }
    return styles[level]
  }

  info(category: string, message: string, data?: any) {
    this.log("info", category, message, data)
  }

  warn(category: string, message: string, data?: any) {
    this.log("warn", category, message, data)
  }

  error(category: string, message: string, data?: any) {
    this.log("error", category, message, data)
  }

  success(category: string, message: string, data?: any) {
    this.log("success", category, message, data)
  }

  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener)
    listener([...this.logs])

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  getLogs() {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
    this.listeners.forEach((listener) => listener([]))
  }

  exportLogs() {
    const data = {
      timestamp: new Date().toISOString(),
      logs: this.logs,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `debug-logs-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

export const debugLogger = new DebugLogger()
