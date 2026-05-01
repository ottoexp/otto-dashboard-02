interface ErrorLogData {
  userId?: string
  userEmail?: string
  endpoint?: string
  error: string
  stack?: string
  userAgent?: string
  ip?: string
  body?: any
}

export async function logError(errorLogData: Omit<ErrorLogData, 'userId' | 'userAgent' | 'ip'>) {
  try {
    const userId = localStorage.getItem('userId') || undefined
    const userEmail = localStorage.getItem('userEmail') || undefined
    
    const data: ErrorLogData = {
      ...errorLogData,
      userId,
      userEmail,
      userAgent: navigator.userAgent,
      ip: undefined
    }

    await fetch(`${import.meta.env.VITE_API_URL}/error-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  } catch (error) {
    console.error('Failed to send error log:', error)
  }
}

export function setupGlobalErrorHandlers() {
  window.addEventListener('error', (event) => {
    logError({
      endpoint: window.location.pathname,
      error: event.message,
      stack: event.error?.stack || undefined,
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    logError({
      endpoint: window.location.pathname,
      error: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack || undefined,
    })
  })
}
