import { describe, it, expect, beforeEach } from 'vitest'
import { parseRoute, buildUrl, getBaseUrl, navigateTo, syncStepToUrl } from '@/lib/router'

describe('Router & URL Navigation', () => {
  beforeEach(() => {
    // Reset window.location
    window.history.replaceState(null, '', '/')
  })

  describe('getBaseUrl & buildUrl', () => {
    it('returns valid base url ending with /', () => {
      const base = getBaseUrl()
      expect(base.startsWith('/')).toBe(true)
      expect(base.endsWith('/')).toBe(true)
    })

    it('builds canonical URLs for all pages and steps', () => {
      expect(buildUrl('home')).toBe('/')
      expect(buildUrl('logic')).toBe('/calc-logic')
      expect(buildUrl('sip')).toBe('/sip')
      expect(buildUrl('investment')).toBe('/investment')
      expect(buildUrl('fd')).toBe('/fd')
      expect(buildUrl('interest')).toBe('/loan-emi')
      expect(buildUrl('profile')).toBe('/profile')
      expect(buildUrl('calculator')).toBe('/calculator?step=1')
      expect(buildUrl('calculator', 3)).toBe('/calculator?step=3')
      expect(buildUrl('calculator', 6)).toBe('/calculator?step=6')
    })

    it('clamps calculator steps within [1, 6]', () => {
      expect(buildUrl('calculator', 0)).toBe('/calculator?step=1')
      expect(buildUrl('calculator', -5)).toBe('/calculator?step=1')
      expect(buildUrl('calculator', 10)).toBe('/calculator?step=6')
      expect(buildUrl('calculator', NaN)).toBe('/calculator?step=1')
    })
  })

  describe('parseRoute', () => {
    it('parses root / as home page', () => {
      const route = parseRoute({ pathname: '/', search: '', hash: '' })
      expect(route.page).toBe('home')
    })

    it('parses /home as home page', () => {
      const route = parseRoute({ pathname: '/home', search: '', hash: '' })
      expect(route.page).toBe('home')
    })

    it('parses /calc-logic as logic page', () => {
      const route = parseRoute({ pathname: '/calc-logic', search: '', hash: '' })
      expect(route.page).toBe('logic')
    })

    it('parses /sip as sip calculator page', () => {
      expect(parseRoute({ pathname: '/sip', search: '', hash: '' }).page).toBe('sip')
      expect(parseRoute({ pathname: '/sip-calculator', search: '', hash: '' }).page).toBe('sip')
      expect(parseRoute({ pathname: '/', search: '', hash: '#sip' }).page).toBe('sip')
    })

    it('parses /investment as investment calculator page', () => {
      expect(parseRoute({ pathname: '/investment', search: '', hash: '' }).page).toBe('investment')
      expect(parseRoute({ pathname: '/investment-calculator', search: '', hash: '' }).page).toBe(
        'investment'
      )
      expect(parseRoute({ pathname: '/', search: '', hash: '#investment' }).page).toBe('investment')
    })

    it('parses /fd as fixed deposit calculator page', () => {
      expect(parseRoute({ pathname: '/fd', search: '', hash: '' }).page).toBe('fd')
      expect(parseRoute({ pathname: '/fd-calculator', search: '', hash: '' }).page).toBe('fd')
      expect(parseRoute({ pathname: '/', search: '', hash: '#fd' }).page).toBe('fd')
    })

    it('parses /loan-emi as loan EMI calculator page', () => {
      expect(parseRoute({ pathname: '/loan-emi', search: '', hash: '' }).page).toBe('interest')
      expect(parseRoute({ pathname: '/emi-calculator', search: '', hash: '' }).page).toBe(
        'interest'
      )
      expect(parseRoute({ pathname: '/interest', search: '', hash: '' }).page).toBe('interest')
      expect(parseRoute({ pathname: '/', search: '', hash: '#loan-emi' }).page).toBe('interest')
    })

    it('parses /profile as profile page', () => {
      expect(parseRoute({ pathname: '/profile', search: '', hash: '' }).page).toBe('profile')
      expect(parseRoute({ pathname: '/user-profile', search: '', hash: '' }).page).toBe('profile')
      expect(parseRoute({ pathname: '/', search: '', hash: '#profile' }).page).toBe('profile')
    })

    it('parses /logic and other logic aliases', () => {
      expect(parseRoute({ pathname: '/logic', search: '', hash: '' }).page).toBe('logic')
      expect(parseRoute({ pathname: '/features-and-logic', search: '', hash: '' }).page).toBe(
        'logic'
      )
      expect(parseRoute({ pathname: '/methodology', search: '', hash: '' }).page).toBe('logic')
    })

    it('parses /calculator with query param ?step=X', () => {
      const route1 = parseRoute({ pathname: '/calculator', search: '?step=1', hash: '' })
      expect(route1.page).toBe('calculator')
      expect(route1.step).toBe(1)

      const route4 = parseRoute({ pathname: '/calculator', search: '?step=4', hash: '' })
      expect(route4.page).toBe('calculator')
      expect(route4.step).toBe(4)

      const route6 = parseRoute({ pathname: '/calculator', search: '?step=6', hash: '' })
      expect(route6.page).toBe('calculator')
      expect(route6.step).toBe(6)
    })

    it('clamps query param ?step to [1, 6]', () => {
      const routeTooHigh = parseRoute({ pathname: '/calculator', search: '?step=99', hash: '' })
      expect(routeTooHigh.step).toBe(6)

      const routeTooLow = parseRoute({ pathname: '/calculator', search: '?step=-3', hash: '' })
      expect(routeTooLow.step).toBe(1)

      const routeInvalid = parseRoute({
        pathname: '/calculator',
        search: '?step=invalid',
        hash: '',
      })
      expect(routeInvalid.step).toBe(1)
    })

    it('parses /wizard alias as calculator page', () => {
      const route = parseRoute({ pathname: '/wizard', search: '?step=2', hash: '' })
      expect(route.page).toBe('calculator')
      expect(route.step).toBe(2)
    })

    it('supports hash fallback like #/calculator?step=5', () => {
      const route = parseRoute({ pathname: '/', search: '', hash: '#/calculator?step=5' })
      expect(route.page).toBe('calculator')
      expect(route.step).toBe(5)
    })

    it('supports simple hash aliases like #logic and #calculator', () => {
      expect(parseRoute({ pathname: '/', search: '', hash: '#logic' }).page).toBe('logic')
      expect(parseRoute({ pathname: '/', search: '', hash: '#calculator' }).page).toBe('calculator')
      expect(parseRoute({ pathname: '/', search: '', hash: '#home' }).page).toBe('home')
    })

    it('supports static SPA redirect (?p=...) restoration', () => {
      const route = parseRoute({
        pathname: '/',
        search: '?p=' + encodeURIComponent('/calculator?step=4'),
        hash: '',
      })
      expect(route.page).toBe('calculator')
      expect(route.step).toBe(4)
    })

    it('falls back to home for unknown paths', () => {
      const route = parseRoute({ pathname: '/some-unknown-route', search: '', hash: '' })
      expect(route.page).toBe('home')
    })
  })

  describe('navigateTo & syncStepToUrl', () => {
    it('updates window.history when navigating', () => {
      navigateTo('/calc-logic', { scroll: false })
      expect(window.location.pathname).toBe('/calc-logic')

      navigateTo('/calculator?step=2', { scroll: false })
      expect(window.location.pathname).toBe('/calculator')
      expect(window.location.search).toBe('?step=2')
    })

    it('syncStepToUrl updates step query param when on calculator page', () => {
      navigateTo('/calculator?step=1', { scroll: false })
      expect(window.location.search).toBe('?step=1')

      syncStepToUrl(3)
      expect(window.location.pathname).toBe('/calculator')
      expect(window.location.search).toBe('?step=3')

      syncStepToUrl(6)
      expect(window.location.search).toBe('?step=6')
    })

    it('syncStepToUrl does not alter path when on home or logic page', () => {
      navigateTo('/calc-logic', { scroll: false })
      syncStepToUrl(4)
      expect(window.location.pathname).toBe('/calc-logic')
    })
  })
})
