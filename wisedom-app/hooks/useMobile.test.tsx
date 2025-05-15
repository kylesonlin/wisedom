import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useMobile } from './useMobile'

describe('useMobile', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    // Reset window.innerWidth before each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return false for desktop width', () => {
    // Set desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(false)
  })

  it('should return true for mobile width', () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(true)
  })

  it('should update when window is resized', () => {
    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(false)

    // Simulate window resize to mobile width
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))
    })

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(150)
    })

    expect(result.current).toBe(true)
  })

  it('should debounce resize events', () => {
    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(false)

    // Simulate multiple rapid resize events
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('resize'))
    })

    // Should not update immediately
    expect(result.current).toBe(false)

    // Should update after debounce
    act(() => {
      jest.advanceTimersByTime(150)
    })

    expect(result.current).toBe(true)
  })

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useMobile())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
}) 