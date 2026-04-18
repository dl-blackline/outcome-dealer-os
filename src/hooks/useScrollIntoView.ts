import { useEffect, useRef } from 'react'

/**
 * Hook to trigger animation class when element scrolls into view.
 * Adds "in-view" class to trigger CSS animations for scroll-based entry effects.
 */
export function useScrollIntoView() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Use Intersection Observer for performant scroll detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px', // Trigger slightly before fully in view
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return ref
}
