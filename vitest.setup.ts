import '@testing-library/jest-dom/vitest'
import { afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import type {} from 'vitest-axe/extend-expect'

afterEach(() => {
  cleanup()
})

beforeAll(() => {
  if (!global.ResizeObserver) {
    class MockResizeObserver implements ResizeObserver {
      private readonly callback: ResizeObserverCallback

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }

      observe(): void {
        const entry = {
          target: document.body,
          contentRect: {
            width: 1024,
            height: 768,
            top: 0,
            left: 0,
            bottom: 768,
            right: 1024,
            x: 0,
            y: 0,
            toJSON() {
              return {}
            },
          },
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        } as unknown as ResizeObserverEntry

        this.callback([entry], this)
      }

      unobserve(): void {}

      disconnect(): void {}
    }

    Object.defineProperty(global, 'ResizeObserver', {
      writable: true,
      configurable: true,
      value: MockResizeObserver,
    })
  }

  if (!('matchMedia' in window)) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }

  if (!('scrollTo' in window)) {
    Object.defineProperty(window, 'scrollTo', {
      writable: true,
      configurable: true,
      value: vi.fn(),
    })
  }

  if (!('getBBox' in SVGElement.prototype)) {
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      writable: true,
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        width: 300,
        height: 150,
        toJSON() {
          return {}
        },
      }),
    })
  }

  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: 1024,
  })

  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: 768,
  })
})
