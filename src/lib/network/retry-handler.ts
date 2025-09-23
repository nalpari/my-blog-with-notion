interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: Error) => boolean
  onRetry?: (attempt: number, error: Error) => void
}

const defaultRetryCondition = (error: Error): boolean => {
  // Retry on network errors or 5xx server errors
  if (error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('ECONNREFUSED')) {
    return true
  }

  // Check if it's an HTTP error
  if ('status' in error && typeof error.status === 'number') {
    return error.status >= 500 && error.status < 600
  }

  return false
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = defaultRetryCondition,
    onRetry,
  } = options

  let lastError: Error
  let delay = initialDelay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Check if we should retry
      if (!retryCondition(lastError) || attempt === maxRetries) {
        throw lastError
      }

      // Notify about retry
      if (onRetry) {
        onRetry(attempt, lastError)
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay))

      // Calculate next delay
      delay = Math.min(delay * backoffFactor, maxDelay)
    }
  }

  throw lastError!
}

// Retry handler with circuit breaker pattern
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime: number | null = null
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000, // 1 minute
    private readonly resetTimeout = 30000 // 30 seconds
  ) {}

  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => T | Promise<T>
  ): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      if (Date.now() - (this.lastFailureTime || 0) > this.timeout) {
        this.state = 'half-open'
      } else if (fallback) {
        return fallback()
      } else {
        throw new Error('Circuit breaker is open')
      }
    }

    try {
      const result = await fn()

      // Always reset on success
      this.failures = 0
      this.state = 'closed'

      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()

      // If half-open, immediately transition to open on any failure
      if (this.state === 'half-open') {
        this.state = 'open'
      } else if (this.failures >= this.threshold) {
        this.state = 'open'
      }

      if (fallback && this.state === 'open') {
        return fallback()
      }

      throw error
    }
  }

  reset(): void {
    this.failures = 0
    this.lastFailureTime = null
    this.state = 'closed'
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    }
  }
}

// Exponential backoff utility
export function exponentialBackoff(
  attempt: number,
  initialDelay = 1000,
  maxDelay = 10000,
  factor = 2
): number {
  const delay = Math.min(initialDelay * Math.pow(factor, attempt - 1), maxDelay)
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay
  return delay + jitter
}

// Request queue for managing concurrent requests
export class RequestQueue {
  private queue: Array<() => Promise<unknown>> = []
  private processing = false
  private readonly maxConcurrent: number
  private activeRequests = 0

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent
  }

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.process()
    })
  }

  private async process(): Promise<void> {
    if (this.processing || this.activeRequests >= this.maxConcurrent) {
      return
    }

    this.processing = true

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift()
      if (request) {
        this.activeRequests++
        request().finally(() => {
          this.activeRequests--
          this.process()
        })
      }
    }

    this.processing = false
  }

  getQueueSize(): number {
    return this.queue.length
  }

  clear(): void {
    this.queue = []
  }
}