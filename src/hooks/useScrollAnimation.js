import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Intersection Observer hook — triggers once when element enters viewport.
 * @param {object} options
 * @param {number} options.threshold  — 0-1, how much should be visible
 * @param {string} options.rootMargin — margin around root
 */
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -60px 0px' } = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el) // only animate once
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, isVisible]
}

/**
 * Parallax hook — returns a Y offset based on scroll position.
 * Uses requestAnimationFrame throttling for optimal performance.
 * @param {number} speed — multiplier (0.1 = subtle, 0.5 = dramatic)
 */
export function useParallax(speed = 0.15) {
  const ref = useRef(null)
  const [offset, setOffset] = useState(0)
  const rafRef = useRef(null)
  const tickingRef = useRef(false)

  const updateOffset = useCallback(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const windowH = window.innerHeight
    if (rect.bottom > -200 && rect.top < windowH + 200) {
      const center = rect.top + rect.height / 2
      const viewCenter = windowH / 2
      setOffset((center - viewCenter) * speed)
    }
    tickingRef.current = false
  }, [speed])

  const handleScroll = useCallback(() => {
    if (!tickingRef.current) {
      tickingRef.current = true
      rafRef.current = requestAnimationFrame(updateOffset)
    }
  }, [updateOffset])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // initial
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [handleScroll])

  return [ref, offset]
}

/**
 * Counter hook — animates a number from 0 to target when visible.
 * @param {number} target — end value
 * @param {number} duration — animation duration in ms
 */
export function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [hasStarted, target, duration])

  return [ref, count]
}

/**
 * Staggered children reveal — returns ref + visibility for a container.
 * Children should use CSS transition-delay based on their index.
 */
export function useStaggerReveal({ threshold = 0.1, rootMargin = '0px 0px -40px 0px' } = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, isVisible]
}
