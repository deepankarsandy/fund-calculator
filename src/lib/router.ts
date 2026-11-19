import { useState, useEffect } from 'react'
import { getStoredSettings } from '@/lib/settingsStorage'

export type PageRoute = 'home' | 'logic' | 'calculator'

export interface AppRoute {
  page: PageRoute
  step?: number
}

type RouteListener = (route: AppRoute) => void

const listeners = new Set<RouteListener>()

/**
 * Normalizes Vite's BASE_URL to always start and end with '/'.
 */
export function getBaseUrl(): string {
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/'
  let clean = base.startsWith('/') ? base : '/' + base
  if (!clean.endsWith('/')) {
    clean += '/'
  }
  return clean
}

/**
 * Builds a canonical URL for a given page and optional step.
 */
export function buildUrl(page: PageRoute, step?: number): string {
  const base = getBaseUrl()
  switch (page) {
    case 'home':
      return base
    case 'logic':
      return `${base}calc-logic`
    case 'calculator': {
      const s = typeof step === 'number' && !isNaN(step) ? Math.min(Math.max(1, step), 6) : 1
      return `${base}calculator?step=${s}`
    }
  }
}

/**
 * Parses the current window.location or provided location object into an AppRoute.
 */
export function parseRoute(locationObj?: { pathname: string; search: string; hash: string }): AppRoute {
  if (typeof window === 'undefined' && !locationObj) {
    return { page: 'home' }
  }

  const pathname = locationObj?.pathname ?? window.location.pathname
  const search = locationObj?.search ?? window.location.search
  const hash = locationObj?.hash ?? window.location.hash

  // Check for SPA redirect query parameter (?p=...)
  const initialParams = new URLSearchParams(search)
  if (initialParams.has('p')) {
    const redirected = decodeURIComponent(initialParams.get('p') || '')
    try {
      const dummyUrl = new URL(redirected, 'http://localhost')
      return parseRoute({
        pathname: dummyUrl.pathname,
        search: dummyUrl.search,
        hash: dummyUrl.hash,
      })
    } catch {
      // Ignore URL parsing error
    }
  }

  // Check for Hash-based routing (#/calculator?step=2, #calculator, #logic, etc.)
  if (hash) {
    const rawHash = hash.startsWith('#') ? hash.slice(1) : hash
    if (rawHash.startsWith('/')) {
      try {
        const dummyUrl = new URL('http://localhost' + rawHash)
        return parseRoute({
          pathname: dummyUrl.pathname,
          search: dummyUrl.search,
          hash: '',
        })
      } catch {
        // Fall through
      }
    } else {
      const lower = rawHash.toLowerCase()
      if (
        lower === 'logic' ||
        lower === 'calc-logic' ||
        lower === 'features' ||
        lower === 'features-and-logic' ||
        lower === 'methodology'
      ) {
        return { page: 'logic' }
      }
      if (lower === 'calculator' || lower === 'wizard') {
        const step = getStoredSettings().currentStep || 1
        return { page: 'calculator', step }
      }
      if (lower === 'home' || lower === '') {
        return { page: 'home' }
      }
    }
  }

  // Path-based routing
  const base = getBaseUrl()
  let normalizedPath = pathname
  if (normalizedPath.startsWith(base)) {
    normalizedPath = normalizedPath.slice(base.length)
  }
  normalizedPath = normalizedPath.replace(/^\/+|\/+$/g, '').toLowerCase()

  if (
    normalizedPath === 'calc-logic' ||
    normalizedPath === 'logic' ||
    normalizedPath === 'features-and-logic' ||
    normalizedPath === 'methodology'
  ) {
    return { page: 'logic' }
  }

  if (normalizedPath === 'calculator' || normalizedPath === 'wizard') {
    const params = new URLSearchParams(search)
    const stepParam = params.get('step')
    let step = 1
    if (stepParam) {
      const parsed = parseInt(stepParam, 10)
      if (!isNaN(parsed)) {
        step = Math.min(Math.max(1, parsed), 6)
      } else {
        step = getStoredSettings().currentStep || 1
      }
    } else {
      step = getStoredSettings().currentStep || 1
    }
    return { page: 'calculator', step }
  }

  // Default to home for root or unmapped paths
  return { page: 'home' }
}

export function getCurrentRoute(): AppRoute {
  return parseRoute()
}

export function notifyRouteListeners(): void {
  const current = getCurrentRoute()
  listeners.forEach(fn => fn(current))
}

/**
 * Navigates to a new URL using HTML5 History API.
 */
export function navigateTo(url: string, options?: { replace?: boolean; scroll?: boolean }): void {
  if (typeof window === 'undefined') return
  const replace = options?.replace ?? false
  const scroll = options?.scroll ?? true

  const fullUrl = url.startsWith('/') || url.startsWith('http') ? url : getBaseUrl() + url

  if (replace) {
    window.history.replaceState(null, '', fullUrl)
  } else {
    window.history.pushState(null, '', fullUrl)
  }

  if (scroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  notifyRouteListeners()
}

export function navigateToHome(options?: { replace?: boolean }): void {
  navigateTo(buildUrl('home'), options)
}

export function navigateToLogic(options?: { replace?: boolean }): void {
  navigateTo(buildUrl('logic'), options)
}

export function navigateToCalculator(step: number = 1, options?: { replace?: boolean }): void {
  navigateTo(buildUrl('calculator', step), options)
}

export function navigateBack(fallbackPage: PageRoute = 'home'): void {
  if (typeof window === 'undefined') return
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo(buildUrl(fallbackPage))
  }
}

/**
 * Synchronizes step to URL query param when on the calculator page.
 */
export function syncStepToUrl(step: number, options?: { replace?: boolean }): void {
  if (typeof window === 'undefined') return
  const current = getCurrentRoute()
  if (current.page === 'calculator') {
    if (current.step !== step) {
      const newUrl = buildUrl('calculator', step)
      if (options?.replace) {
        window.history.replaceState(null, '', newUrl)
      } else {
        window.history.pushState(null, '', newUrl)
      }
      notifyRouteListeners()
    }
  }
}

/**
 * Normalizes any initial URL (e.g. cleans up ?p= redirect or missing ?step= on /calculator).
 */
export function normalizeInitialUrl(): void {
  if (typeof window === 'undefined') return

  const search = window.location.search
  const hash = window.location.hash
  const initialParams = new URLSearchParams(search)

  // Clean SPA redirect
  if (initialParams.has('p')) {
    const route = parseRoute()
    const targetUrl = buildUrl(route.page, route.step)
    window.history.replaceState(null, '', targetUrl)
    notifyRouteListeners()
    return
  }

  // Clean hash route if one was used
  if (
    hash &&
    (hash.startsWith('#/') ||
      hash === '#logic' ||
      hash === '#calc-logic' ||
      hash === '#calculator' ||
      hash === '#wizard' ||
      hash === '#features-and-logic' ||
      hash === '#home')
  ) {
    const route = parseRoute()
    const targetUrl = buildUrl(route.page, route.step)
    window.history.replaceState(null, '', targetUrl)
    notifyRouteListeners()
    return
  }

  // If on /calculator without ?step= param, normalize to /calculator?step=X
  const route = parseRoute()
  if (route.page === 'calculator' && !initialParams.has('step')) {
    const targetUrl = buildUrl('calculator', route.step)
    window.history.replaceState(null, '', targetUrl)
    notifyRouteListeners()
  }
}

/**
 * Hook for components to reactively subscribe to route changes.
 */
export function useRouter() {
  const [route, setRoute] = useState<AppRoute>(() => getCurrentRoute())

  useEffect(() => {
    // Normalize initial URL on mount
    normalizeInitialUrl()

    // Set up popstate listener for browser Back/Forward buttons
    const handlePopState = () => {
      setRoute(getCurrentRoute())
    }
    window.addEventListener('popstate', handlePopState)

    // Set up internal listener for navigateTo calls
    const listener: RouteListener = newRoute => {
      setRoute(newRoute)
    }
    listeners.add(listener)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      listeners.delete(listener)
    }
  }, [])

  return {
    route,
    navigateTo,
    navigateToHome,
    navigateToLogic,
    navigateToCalculator,
    navigateBack,
    syncStepToUrl,
  }
}
