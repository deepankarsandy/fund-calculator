import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateExportData,
  parseAndValidateImportJson,
  createBackup,
  getStoredBackup,
  restoreFromBackup,
  importAllData,
  importSingleSection,
  getSectionDataSummary,
  validateSectionCompatibility,
} from '@/lib/exportImportStorage'
import { USER_PROFILE_STORAGE_KEY } from '@/lib/userProfileStorage'
import { SETTINGS_STORAGE_KEY } from '@/lib/settingsStorage'
import { SIP_INPUTS_STORAGE_KEY } from '@/lib/sipStorage'

describe('Export & Import Storage Logic', () => {
  const mockStorage: Record<string, string> = {}

  beforeEach(() => {
    // Clear in-memory mock storage
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key]
    }

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = String(value)
      },
      removeItem: (key: string) => {
        delete mockStorage[key]
      },
      clear: () => {
        for (const key of Object.keys(mockStorage)) {
          delete mockStorage[key]
        }
      },
    })
  })

  describe('generateExportData', () => {
    it('packages all existing localStorage items into export structure', () => {
      mockStorage[USER_PROFILE_STORAGE_KEY] = JSON.stringify({
        name: 'Aarav Sharma',
        currentAge: 32,
        targetRetirementAge: 55,
      })
      mockStorage[SETTINGS_STORAGE_KEY] = JSON.stringify({
        currentStep: 2,
        expandedCategories: ['housing'],
      })
      mockStorage['corpus_theme'] = 'dark'

      const exported = generateExportData()

      expect(exported.version).toBe(1)
      expect(exported.appName).toBe('Fund Calculator')
      expect(exported.exportedAt).toBeDefined()
      expect(exported.sections.profile).toBeDefined()
      expect(exported.sections.profile.name).toBe('Aarav Sharma')
      expect(exported.sections.settings.currentStep).toBe(2)
      expect(exported.rawStorage[USER_PROFILE_STORAGE_KEY]).toBeDefined()
      expect(exported.rawStorage['corpus_theme']).toBe('dark')
    })
  })

  describe('validateSectionCompatibility', () => {
    it('validates profile schemas and catches out-of-bounds or malformed fields', () => {
      expect(validateSectionCompatibility('profile', null).isValid).toBe(false)
      expect(validateSectionCompatibility('profile', 'invalid-string').isValid).toBe(false)
      expect(validateSectionCompatibility('profile', { unknownField: 123 }).isValid).toBe(false)

      // Age out of bounds
      expect(
        validateSectionCompatibility('profile', { name: 'Test', currentAge: -5 }).isValid
      ).toBe(false)
      expect(
        validateSectionCompatibility('profile', { name: 'Test', currentAge: 150 }).isValid
      ).toBe(false)
      expect(
        validateSectionCompatibility('profile', { name: 'Test', currentAge: NaN }).isValid
      ).toBe(false)

      // Valid profile
      expect(
        validateSectionCompatibility('profile', {
          name: 'Aarav',
          currentAge: 30,
          retirementAge: 60,
          monthlyIncome: 100000,
        }).isValid
      ).toBe(true)
    })

    it('validates retirement wizard categories and members arrays', () => {
      expect(validateSectionCompatibility('retirement', null).isValid).toBe(false)
      expect(validateSectionCompatibility('retirement', { random: 123 }).isValid).toBe(false)

      // Categories is not array
      expect(
        validateSectionCompatibility('retirement', { categories: 'not-an-array' }).isValid
      ).toBe(false)

      // Malformed category item
      expect(
        validateSectionCompatibility('retirement', { categories: [{ missingId: true }] }).isValid
      ).toBe(false)

      // Category items is not array
      expect(
        validateSectionCompatibility('retirement', {
          categories: [{ id: 'housing', items: 'bad-items' }],
        }).isValid
      ).toBe(false)

      // Members is not array
      expect(
        validateSectionCompatibility('retirement', {
          categories: [{ id: 'housing', items: [] }],
          members: 'not-an-array',
        }).isValid
      ).toBe(false)

      // Valid retirement state
      expect(
        validateSectionCompatibility('retirement', {
          categories: [{ id: 'housing', items: [] }],
          members: [{ id: 'self', name: 'Self', age: 30 }],
        }).isValid
      ).toBe(true)
    })

    it('validates SIP, SWP, FD, and Loan EMI schemas', () => {
      // SIP invalid
      expect(
        validateSectionCompatibility('sip', { sip: { monthlyInvestment: -100 } }).isValid
      ).toBe(false)
      expect(
        validateSectionCompatibility('sip', { sip: { monthlyInvestment: 'abc' } }).isValid
      ).toBe(false)
      // SIP valid
      expect(
        validateSectionCompatibility('sip', { mode: 'sip', sip: { monthlyInvestment: 25000 } })
          .isValid
      ).toBe(true)

      // FD invalid (rate > 100 or negative principal)
      expect(
        validateSectionCompatibility('fd', { principal: -1000, annualInterestRate: 7 }).isValid
      ).toBe(false)
      expect(
        validateSectionCompatibility('fd', { principal: 50000, annualInterestRate: 150 }).isValid
      ).toBe(false)
      // FD valid
      expect(
        validateSectionCompatibility('fd', { principal: 500000, annualInterestRate: 7.2 }).isValid
      ).toBe(true)

      // Loan EMI invalid
      expect(
        validateSectionCompatibility('loanEmi', { principal: -5000, annualInterestRate: 8.5 })
          .isValid
      ).toBe(false)
      // Loan EMI valid
      expect(
        validateSectionCompatibility('loanEmi', { principal: 2500000, annualInterestRate: 8.5 })
          .isValid
      ).toBe(true)

      // Theme validation
      expect(validateSectionCompatibility('theme', 'invalid-theme').isValid).toBe(false)
      expect(validateSectionCompatibility('theme', 'dark').isValid).toBe(true)
      expect(validateSectionCompatibility('theme', 'system').isValid).toBe(true)
    })
  })

  describe('parseAndValidateImportJson', () => {
    it('rejects invalid or empty json', () => {
      expect(parseAndValidateImportJson('').success).toBe(false)
      expect(parseAndValidateImportJson('{ broken json').success).toBe(false)
      expect(parseAndValidateImportJson('null').success).toBe(false)
    })

    it('rejects JSON with no recognizable calculator data', () => {
      const res = parseAndValidateImportJson(JSON.stringify({ randomKey: 'hello' }))
      expect(res.success).toBe(false)
      expect(res.error).toContain('No recognizable Fund Calculator data')
    })

    it('parses structured export data and validates compatibility', () => {
      const sample = {
        version: 1,
        appName: 'Fund Calculator',
        exportedAt: '2026-11-20T10:00:00.000Z',
        sections: {
          profile: { name: 'Priya', currentAge: 28, targetRetirementAge: 50 },
          sip: { inputs: { mode: 'sip', sip: { monthlyInvestment: 35000 } } },
        },
        rawStorage: {},
      }

      const res = parseAndValidateImportJson(JSON.stringify(sample))
      expect(res.success).toBe(true)
      expect(res.data?.sectionsFound.length).toBe(2)
      expect(res.data?.compatibleCount).toBe(2)
      expect(res.data?.incompatibleCount).toBe(0)

      const profile = res.data?.sectionsFound.find((s) => s.id === 'profile')
      expect(profile).toBeDefined()
      expect(profile?.isValid).toBe(true)
      expect(profile?.summary).toContain('Priya')
    })

    it('flags incompatible sections with descriptive error messages', () => {
      const sample = {
        version: 1,
        appName: 'Fund Calculator',
        sections: {
          profile: { name: 'Priya', currentAge: -99 }, // Incompatible negative age
          theme: 'neon-rainbow', // Incompatible theme
        },
      }

      const res = parseAndValidateImportJson(JSON.stringify(sample))
      expect(res.success).toBe(true)
      expect(res.data?.compatibleCount).toBe(0)
      expect(res.data?.incompatibleCount).toBe(2)

      const prof = res.data?.sectionsFound.find((s) => s.id === 'profile')
      expect(prof?.isValid).toBe(false)
      expect(prof?.error).toContain('Invalid currentAge')

      const theme = res.data?.sectionsFound.find((s) => s.id === 'theme')
      expect(theme?.isValid).toBe(false)
      expect(theme?.error).toContain('Incompatible theme mode')
    })

    it('parses raw localStorage key dumps correctly', () => {
      const sample = {
        [USER_PROFILE_STORAGE_KEY]: JSON.stringify({ name: 'Vikram', currentAge: 40 }),
        [SIP_INPUTS_STORAGE_KEY]: JSON.stringify({ mode: 'sip' }),
      }

      const res = parseAndValidateImportJson(JSON.stringify(sample))
      expect(res.success).toBe(true)
      expect(res.data?.sectionsFound.length).toBe(2)
      expect(res.data?.rawStorageMap[USER_PROFILE_STORAGE_KEY]).toBeDefined()
    })
  })

  describe('Backup & Restore', () => {
    it('creates a pre-import backup and stores it in BACKUP_STORAGE_KEY', () => {
      mockStorage[USER_PROFILE_STORAGE_KEY] = JSON.stringify({ name: 'Original User' })
      mockStorage['corpus_theme'] = 'light'

      const backup = createBackup('Pre-import backup: Test')
      expect(backup).not.toBeNull()
      expect(backup?.reason).toBe('Pre-import backup: Test')
      expect(backup?.rawStorage[USER_PROFILE_STORAGE_KEY]).toContain('Original User')

      const stored = getStoredBackup()
      expect(stored).not.toBeNull()
      expect(stored?.rawStorage['corpus_theme']).toBe('light')
    })

    it('maintains only one single backup, overwriting previous backup', () => {
      mockStorage[USER_PROFILE_STORAGE_KEY] = JSON.stringify({ name: 'First' })
      createBackup('Backup 1')

      mockStorage[USER_PROFILE_STORAGE_KEY] = JSON.stringify({ name: 'Second' })
      createBackup('Backup 2')

      const stored = getStoredBackup()
      expect(stored?.reason).toBe('Backup 2')
      expect(stored?.rawStorage[USER_PROFILE_STORAGE_KEY]).toContain('Second')
    })

    it('restores all keys from backup snapshot into localStorage', () => {
      mockStorage[USER_PROFILE_STORAGE_KEY] = JSON.stringify({ name: 'Pre-Import Name' })
      const backup = createBackup('Backup before overwrite')!

      // Overwrite current data
      mockStorage[USER_PROFILE_STORAGE_KEY] = JSON.stringify({ name: 'Overwritten Name' })

      const success = restoreFromBackup(backup)
      expect(success).toBe(true)
      expect(mockStorage[USER_PROFILE_STORAGE_KEY]).toContain('Pre-Import Name')
    })
  })

  describe('importAllData and importSingleSection', () => {
    it('creates backup and overwrites only compatible sections when importAllData is called', () => {
      mockStorage[USER_PROFILE_STORAGE_KEY] = JSON.stringify({ name: 'Before Import' })
      mockStorage['corpus_theme'] = 'light'

      const parsed = parseAndValidateImportJson(
        JSON.stringify({
          sections: {
            profile: { name: 'Imported User', currentAge: 35 },
            theme: 'unsupported-neon-mode', // Incompatible section!
          },
        })
      )

      expect(parsed.success).toBe(true)
      expect(parsed.data?.compatibleCount).toBe(1)
      expect(parsed.data?.incompatibleCount).toBe(1)

      const result = importAllData(parsed.data!)
      expect(result.success).toBe(true)
      expect(result.importedCount).toBe(1)
      expect(result.skippedCount).toBe(1)

      // Profile is updated because it is compatible
      expect(mockStorage[USER_PROFILE_STORAGE_KEY]).toContain('Imported User')

      // Theme remains untouched because it was incompatible
      expect(mockStorage['corpus_theme']).toBe('light')

      // Backup contains pre-import data
      const backup = getStoredBackup()
      expect(backup?.reason).toContain('Pre-import backup')
      expect(backup?.rawStorage[USER_PROFILE_STORAGE_KEY]).toContain('Before Import')
    })

    it('creates backup and updates only specified section when importSingleSection is called', () => {
      mockStorage[USER_PROFILE_STORAGE_KEY] = JSON.stringify({ name: 'Existing User' })
      mockStorage['corpus_theme'] = 'light'

      const parsed = parseAndValidateImportJson(
        JSON.stringify({
          sections: {
            theme: 'dark',
          },
        })
      )

      const imported = importSingleSection('theme', parsed.data!)
      expect(imported).toBe(true)

      // Theme is updated
      expect(mockStorage['corpus_theme']).toBe('dark')
      // Profile remains untouched
      expect(mockStorage[USER_PROFILE_STORAGE_KEY]).toContain('Existing User')

      // Backup is captured
      const backup = getStoredBackup()
      expect(backup?.reason).toContain('Theme Preference')
    })

    it('refuses to import an incompatible section', () => {
      mockStorage['corpus_theme'] = 'light'

      const parsed = parseAndValidateImportJson(
        JSON.stringify({
          sections: {
            theme: 'invalid-mode',
          },
        })
      )

      const imported = importSingleSection('theme', parsed.data!)
      expect(imported).toBe(false)
      // Storage unchanged
      expect(mockStorage['corpus_theme']).toBe('light')
    })
  })

  describe('getSectionDataSummary', () => {
    it('produces readable summaries for all sections', () => {
      const profSummary = getSectionDataSummary('profile', {
        name: 'Raj',
        currentAge: 30,
        targetRetirementAge: 55,
      })
      expect(profSummary).toContain('Raj')
      expect(profSummary).toContain('Age 30')

      const retSummary = getSectionDataSummary('retirement', {
        categories: [{ id: 'housing' }],
        members: [{ id: 'self' }],
      })
      expect(retSummary).toContain('1 categories')
      expect(retSummary).toContain('1 members')

      const sipSummary = getSectionDataSummary('sip', {
        mode: 'sip',
        sip: { monthlyInvestment: 25000 },
      })
      expect(sipSummary).toContain('SIP')
      expect(sipSummary).toContain('25,000')

      const themeSummary = getSectionDataSummary('theme', 'dark')
      expect(themeSummary).toBe('Mode: dark')
    })
  })
})
