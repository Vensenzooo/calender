import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface DebugEvent {
  id: string
  timestamp: number
  category: string
  type: string
  message: string
  data?: any
  url?: string
}

interface DebugState {
  events: DebugEvent[]
  isVisible: boolean
  isPinned: boolean
  isExpanded: boolean
  isEnabled: boolean
  activeFilters: string[]
  maxEvents: number
  addEvent: (event: Omit<DebugEvent, "id" | "timestamp">) => void
  clearEvents: () => void
  setVisibility: (visible: boolean) => void
  setPinned: (pinned: boolean) => void
  setExpanded: (expanded: boolean) => void
  setEnabled: (enabled: boolean) => void
  toggleFilter: (filter: string) => void
  setMaxEvents: (max: number) => void
}

export const useDebugStore = create<DebugState>()(
  persist(
    (set) => ({
      events: [],
      isVisible: true,
      isPinned: true,
      isExpanded: false,
      isEnabled: true,
      activeFilters: [],
      maxEvents: 100,

      addEvent: (event) =>
        set((state) => {
          const newEvent: DebugEvent = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: Date.now(),
            ...event,
          }

          // Add to events array and limit size
          const events = [newEvent, ...state.events].slice(0, state.maxEvents)

          // Also log to console with styling
          const style = getConsoleStyleForCategory(event.category)
          console.log(`%c[${event.category}] ${event.type}: ${event.message}`, style, event.data || "")

          return { events }
        }),

      clearEvents: () => set({ events: [] }),

      setVisibility: (isVisible) => set({ isVisible }),

      setPinned: (isPinned) => set({ isPinned }),

      setExpanded: (isExpanded) => set({ isExpanded }),

      setEnabled: (isEnabled) => set({ isEnabled }),

      toggleFilter: (filter) =>
        set((state) => ({
          activeFilters: state.activeFilters.includes(filter)
            ? state.activeFilters.filter((f) => f !== filter)
            : [...state.activeFilters, filter],
        })),

      setMaxEvents: (maxEvents) => set({ maxEvents }),
    }),
    {
      name: "auth-debug-storage",
      partialize: (state) => ({
        isVisible: state.isVisible,
        isPinned: state.isPinned,
        isExpanded: state.isExpanded,
        isEnabled: state.isEnabled,
        activeFilters: state.activeFilters,
        maxEvents: state.maxEvents,
        // Don't persist events to avoid storage bloat
      }),
    },
  ),
)

// Helper function for console styling
function getConsoleStyleForCategory(category: string): string {
  const styles: Record<string, string> = {
    Auth: "color: #3b82f6; font-weight: bold",
    Route: "color: #10b981; font-weight: bold",
    Clerk: "color: #8b5cf6; font-weight: bold",
    Google: "color: #ef4444; font-weight: bold",
    Redirect: "color: #f59e0b; font-weight: bold",
    Error: "color: #ef4444; background: #fee2e2; font-weight: bold; padding: 2px 4px",
    Warning: "color: #f59e0b; background: #fef3c7; font-weight: bold; padding: 2px 4px",
  }

  return styles[category] || "color: #6b7280; font-weight: bold"
}

// Helper function to log events from anywhere in the app
export const debugLog = {
  auth: (type: string, message: string, data?: any) =>
    useDebugStore.getState().addEvent({
      category: "Auth",
      type,
      message,
      data,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }),

  route: (type: string, message: string, data?: any) =>
    useDebugStore.getState().addEvent({
      category: "Route",
      type,
      message,
      data,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }),

  clerk: (type: string, message: string, data?: any) =>
    useDebugStore.getState().addEvent({
      category: "Clerk",
      type,
      message,
      data,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }),

  google: (type: string, message: string, data?: any) =>
    useDebugStore.getState().addEvent({
      category: "Google",
      type,
      message,
      data,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }),

  redirect: (type: string, message: string, data?: any) =>
    useDebugStore.getState().addEvent({
      category: "Redirect",
      type,
      message,
      data,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }),

  error: (type: string, message: string, data?: any) =>
    useDebugStore.getState().addEvent({
      category: "Error",
      type,
      message,
      data,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }),

  warning: (type: string, message: string, data?: any) =>
    useDebugStore.getState().addEvent({
      category: "Warning",
      type,
      message,
      data,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }),

  custom: (category: string, type: string, message: string, data?: any) =>
    useDebugStore.getState().addEvent({
      category,
      type,
      message,
      data,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }),
}
