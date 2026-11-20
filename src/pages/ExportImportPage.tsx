import { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react'
import {
  ArrowLeft,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  User,
  Calculator,
  TrendingUp,
  PiggyBank,
  Landmark,
  Percent,
  Settings,
  Palette,
  X,
  FileCheck,
} from 'lucide-react'
import {
  STORAGE_SECTIONS,
  AppBackup,
  ParsedImportResult,
  generateExportData,
  downloadExportAsJson,
  parseAndValidateImportJson,
  getStoredBackup,
  restoreFromBackup,
  importAllData,
  importSingleSection,
  clearStoredBackup,
} from '@/lib/exportImportStorage'
import { cn } from '@/lib/cn'

interface ExportImportPageProps {
  onBackToHome: () => void
}

type ConfirmModalState =
  | { type: 'all' }
  | { type: 'section'; sectionId: string; sectionName: string }
  | { type: 'restore' }
  | null

function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'user':
      return User
    case 'calculator':
      return Calculator
    case 'trending-up':
      return TrendingUp
    case 'piggy-bank':
      return PiggyBank
    case 'landmark':
      return Landmark
    case 'percent':
      return Percent
    case 'settings':
      return Settings
    case 'palette':
      return Palette
    default:
      return Layers
  }
}

export default function ExportImportPage({ onBackToHome }: ExportImportPageProps) {
  const [backup, setBackup] = useState<AppBackup | null>(() => getStoredBackup())
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null)
  const [parsedImport, setParsedImport] = useState<ParsedImportResult | null>(null)
  const [importedSectionIds, setImportedSectionIds] = useState<Set<string>>(new Set())
  const [parseError, setParseError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [copiedToast, setCopiedToast] = useState(false)
  const [showJsonPreview, setShowJsonPreview] = useState(false)
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error'
    title: string
    description: string
  } | null>(null)
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Refresh backup state on mount and storage changes
  const refreshBackup = () => {
    setBackup(getStoredBackup())
  }

  useEffect(() => {
    refreshBackup()
    const handleStorage = () => refreshBackup()
    window.addEventListener('storage', handleStorage)
    window.addEventListener('fundcalc_data_imported', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('fundcalc_data_imported', handleStorage)
    }
  }, [])

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Handle file reading & parsing
  const handleProcessFile = (file: File) => {
    if (!file) return
    setParseError(null)
    setImportedSectionIds(new Set())

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const result = parseAndValidateImportJson(content)
      if (result.success && result.data) {
        setUploadedFile({ name: file.name, size: file.size })
        setParsedImport(result.data)
        setParseError(null)
      } else {
        setUploadedFile(null)
        setParsedImport(null)
        setParseError(result.error || 'Failed to parse JSON file.')
      }
    }
    reader.onerror = () => {
      setParseError('Error reading uploaded file. Please try again.')
    }
    reader.readAsText(file)
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleCopyJson = () => {
    try {
      const data = generateExportData()
      navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopiedToast(true)
      setTimeout(() => setCopiedToast(false), 2500)
    } catch {
      setToastMessage({
        type: 'error',
        title: 'Copy Failed',
        description: 'Unable to copy JSON to clipboard.',
      })
    }
  }

  // Confirmation actions
  const handleConfirmAction = () => {
    if (!confirmModal) return

    if (confirmModal.type === 'all' && parsedImport) {
      const result = importAllData(parsedImport)
      if (result.success) {
        refreshBackup()
        const compatibleIds = parsedImport.sectionsFound.filter((s) => s.isValid).map((s) => s.id)
        setImportedSectionIds((prev) => new Set([...prev, ...compatibleIds]))
        setToastMessage({
          type: 'success',
          title: 'Import Successful',
          description:
            result.skippedCount > 0
              ? `Imported ${result.importedCount} compatible section(s). ${result.skippedCount} incompatible section(s) were safely skipped.`
              : `All ${result.importedCount} calculator sections have been updated. Pre-import backup was created.`,
        })
      } else {
        setToastMessage({
          type: 'error',
          title: 'Import Failed',
          description: 'No compatible data found to import.',
        })
      }
    } else if (confirmModal.type === 'section' && parsedImport) {
      const { sectionId, sectionName } = confirmModal
      const success = importSingleSection(sectionId, parsedImport)
      if (success) {
        refreshBackup()
        setImportedSectionIds((prev) => new Set([...prev, sectionId]))
        setToastMessage({
          type: 'success',
          title: `${sectionName} Imported`,
          description: `Successfully imported ${sectionName}. A safety backup of your previous state was stored.`,
        })
      } else {
        setToastMessage({
          type: 'error',
          title: 'Import Blocked',
          description: `Unable to import ${sectionName}. The section data structure is incompatible.`,
        })
      }
    } else if (confirmModal.type === 'restore' && backup) {
      const success = restoreFromBackup(backup)
      if (success) {
        refreshBackup()
        setToastMessage({
          type: 'success',
          title: 'Data Restored from Backup',
          description:
            'Your application data has been successfully reverted to the saved backup snapshot.',
        })
      } else {
        setToastMessage({
          type: 'error',
          title: 'Restore Failed',
          description: 'Could not restore data from the saved backup snapshot.',
        })
      }
    }

    setConfirmModal(null)
  }

  const handleClearBackup = () => {
    if (window.confirm('Are you sure you want to delete this backup from local storage?')) {
      clearStoredBackup()
      refreshBackup()
      setToastMessage({
        type: 'success',
        title: 'Backup Cleared',
        description: 'The stored backup has been removed from your browser storage.',
      })
    }
  }

  const exportDataSample = generateExportData()
  const activeSectionsCount = Object.keys(exportDataSample.sections).length

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto px-4 py-6 w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={cn(
            'fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-start gap-3 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300',
            toastMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
          )}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5 flex-1">
            <h4 className="text-xs font-black">{toastMessage.title}</h4>
            <p className="text-[11px] leading-relaxed opacity-90">{toastMessage.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 w-fit">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Client-Side · Zero Server Storage</span>
        </div>
      </div>

      {/* Hero Intro */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Data Portability & Backup</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Export & Import JSON Data
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-3xl leading-relaxed">
          Your entire financial plan and all 5 calculators are saved locally in your browser.
          Download everything into a single JSON file to backup or transfer between computers, or
          import data with automatic pre-import safety backups.
        </p>
      </div>

      {/* Restore Banner (When backup is available) */}
      {backup && (
        <section className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-50/90 via-card to-card dark:from-emerald-950/40 dark:via-card dark:to-card p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
                    Automatic Safety Backup Available
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/90 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                    1 Backup Stored
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created automatically on{' '}
                  <strong className="text-foreground">
                    {new Date(backup.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </strong>{' '}
                  ({backup.reason})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={() => setConfirmModal({ type: 'restore' })}
                className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore from Backup</span>
              </button>
              <button
                type="button"
                onClick={handleClearBackup}
                className="px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground border border-border rounded-xl transition-all cursor-pointer hover:bg-muted/60"
                title="Delete stored backup"
              >
                Clear
              </button>
            </div>
          </div>

          {backup.sectionsPresent.length > 0 && (
            <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground/80">Snapshot contains:</span>
              {backup.sectionsPresent.map((secId) => {
                const sec = STORAGE_SECTIONS.find((s) => s.id === secId)
                return (
                  <span
                    key={secId}
                    className="px-2 py-0.5 rounded-md bg-muted border border-border/80 font-medium text-[10px]"
                  >
                    {sec?.shortTitle || secId}
                  </span>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Main Grid: Export on Left, Import on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ─── EXPORT CARD ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">Export Everything</h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Download all local data as one JSON file
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              Exports your user profile, wizard expense categories, and all 5 financial calculators
              into a clean JSON backup file.
            </p>
          </div>

          {/* Current Stored Content Summary */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span>Current Data on This Device</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {activeSectionsCount} Sections Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {STORAGE_SECTIONS.map((sec) => {
                const isStored = Boolean(exportDataSample.sections[sec.id])
                const IconComp = getIconComponent(sec.icon)
                return (
                  <div
                    key={sec.id}
                    className={cn(
                      'p-2 rounded-lg border flex items-center gap-2',
                      isStored
                        ? 'border-border/90 bg-card text-foreground'
                        : 'border-border/40 bg-muted/30 text-muted-foreground opacity-60'
                    )}
                  >
                    <IconComp className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="text-[11px] font-semibold truncate">{sec.shortTitle}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={downloadExportAsJson}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Everything as JSON</span>
            </button>

            <button
              type="button"
              onClick={handleCopyJson}
              className="w-full py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {copiedToast ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300">
                    Copied to Clipboard!
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-muted-foreground" />
                  <span>Copy JSON to Clipboard</span>
                </>
              )}
            </button>
          </div>

          {/* Optional JSON Preview Drawer */}
          <div className="pt-2 border-t border-border/70">
            <button
              type="button"
              onClick={() => setShowJsonPreview((p) => !p)}
              className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <span>Inspect Export Data Preview</span>
              {showJsonPreview ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showJsonPreview && (
              <pre className="mt-2.5 p-3 rounded-xl bg-zinc-950 text-zinc-100 dark:bg-black font-mono text-[10px] leading-relaxed max-h-48 overflow-auto border border-border/80">
                {JSON.stringify(exportDataSample, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* ─── IMPORT CARD ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">Import from JSON</h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Upload file & selectively import calculators
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              Select an exported JSON backup file. You can import all calculators at once or import
              each calculator individually with confirmation.
            </p>
          </div>

          {/* Hidden HTML file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".json,application/json"
            className="hidden"
          />

          {/* Drag & Drop File Zone */}
          {!uploadedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3',
                isDragOver
                  ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 scale-[0.99]'
                  : 'border-border hover:border-blue-500/80 hover:bg-muted/30 bg-muted/10'
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-extrabold text-foreground">
                  Click to choose a JSON file or drag & drop here
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Supports exported Fund Calculator JSON backups (.json)
                </p>
              </div>
            </div>
          ) : (
            /* Uploaded File Selected Banner */
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-foreground truncate">
                    {uploadedFile.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(1)} KB · Validated JSON
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUploadedFile(null)
                  setParsedImport(null)
                  setParseError(null)
                  setImportedSectionIds(new Set())
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground border border-border rounded-lg bg-card transition-colors cursor-pointer"
              >
                Change File
              </button>
            </div>
          )}

          {/* Parse Error Notification */}
          {parseError && (
            <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Error reading file:</span>
                <p className="text-[11px] opacity-90">{parseError}</p>
              </div>
            </div>
          )}

          {/* Parsed Sections & Import Buttons */}
          {parsedImport && (
            <div className="space-y-4 pt-2 border-t border-border/70">
              {/* Import All Master CTA */}
              <div className="p-4 rounded-xl border-2 border-blue-500/60 bg-blue-50/40 dark:bg-blue-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-foreground">
                      Import All Compatible Data
                    </h4>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {parsedImport.compatibleCount} of {parsedImport.sectionsFound.length}{' '}
                      Compatible
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {parsedImport.incompatibleCount > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        ⚠️ {parsedImport.incompatibleCount} incompatible section(s) will be
                        automatically skipped to prevent data corruption.
                      </span>
                    ) : (
                      'Overwrites all compatible calculators, profile defaults, and settings in one click.'
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={parsedImport.compatibleCount === 0}
                  onClick={() => setConfirmModal({ type: 'all' })}
                  className={cn(
                    'w-full sm:w-auto px-4 py-2 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs shrink-0',
                    parsedImport.compatibleCount === 0
                      ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                      : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  )}
                >
                  {parsedImport.compatibleCount === 0
                    ? 'No Compatible Data'
                    : `Import ${parsedImport.compatibleCount} Section${parsedImport.compatibleCount === 1 ? '' : 's'}`}
                </button>
              </div>

              {/* Individual Section Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Or Import Individual Sections:
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Shows overwrite confirmation
                  </span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {parsedImport.sectionsFound.map((sec) => {
                    const IconComp = getIconComponent(sec.icon)
                    const isImported = importedSectionIds.has(sec.id)
                    return (
                      <div
                        key={sec.id}
                        className={cn(
                          'p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all',
                          !sec.isValid
                            ? 'border-rose-300/80 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20'
                            : isImported
                              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10'
                              : 'border-border bg-card hover:border-border/90'
                        )}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0',
                              !sec.isValid
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                                : isImported
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                  : 'bg-muted border-border text-foreground'
                            )}
                          >
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-extrabold text-foreground truncate">
                                {sec.name}
                              </h5>
                              {!sec.isValid ? (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1 shrink-0">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>Incompatible</span>
                                </span>
                              ) : isImported ? (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0">
                                  <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Done</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                                  Compatible
                                </span>
                              )}
                            </div>

                            {!sec.isValid ? (
                              <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 leading-snug">
                                {sec.error || 'Incompatible data structure for this calculator.'}
                              </p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground truncate leading-snug">
                                {sec.summary}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!sec.isValid}
                          onClick={() =>
                            setConfirmModal({
                              type: 'section',
                              sectionId: sec.id,
                              sectionName: sec.name,
                            })
                          }
                          className={cn(
                            'self-end sm:self-auto px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all shrink-0 flex items-center gap-1',
                            !sec.isValid
                              ? 'bg-muted/50 text-muted-foreground/60 border border-border/40 cursor-not-allowed opacity-60'
                              : isImported
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 cursor-pointer'
                                : 'bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-blue-500/60 cursor-pointer'
                          )}
                          title={!sec.isValid ? sec.error : undefined}
                        >
                          {!sec.isValid ? (
                            <span>Incompatible</span>
                          ) : isImported ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Re-import</span>
                            </>
                          ) : (
                            <span>Import</span>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── CONFIRMATION DIALOG MODAL ────────────────────────────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card text-foreground border border-border rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
                  confirmModal.type === 'restore'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 text-white'
                )}
              >
                {confirmModal.type === 'restore' ? (
                  <RotateCcw className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-foreground">
                  {confirmModal.type === 'restore'
                    ? 'Restore Data from Backup?'
                    : confirmModal.type === 'all'
                      ? 'Overwrite All Calculator Data?'
                      : `Overwrite ${confirmModal.sectionName}?`}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {confirmModal.type === 'restore' ? (
                    <>
                      This will revert your active calculators to the backup taken on{' '}
                      <strong className="text-foreground">
                        {backup &&
                          new Date(backup.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                      </strong>
                      . Any changes made since this backup will be replaced.
                    </>
                  ) : confirmModal.type === 'all' ? (
                    <>
                      This action will overwrite your existing data for the{' '}
                      <strong className="text-foreground">
                        {parsedImport?.compatibleCount} compatible section(s)
                      </strong>{' '}
                      with the data from the uploaded file.
                      {parsedImport && parsedImport.incompatibleCount > 0 && (
                        <span className="block mt-1 text-amber-600 dark:text-amber-400 font-semibold">
                          ⚠️ {parsedImport.incompatibleCount} incompatible section(s) will be
                          skipped to protect your current data.
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      This action will replace your current data for{' '}
                      <strong className="text-foreground">{confirmModal.sectionName}</strong> with
                      the values from the uploaded file.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Safety Backup Guarantee Banner */}
            {confirmModal.type !== 'restore' && (
              <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>Automatic Safety Backup:</strong> Your current state before overwriting
                  will be saved as a backup in your browser storage. You can restore it at any time
                  using the Restore button on this page.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground border border-border rounded-xl transition-colors cursor-pointer hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={cn(
                  'px-4 py-2 text-xs font-extrabold text-white rounded-xl shadow-xs transition-all cursor-pointer',
                  confirmModal.type === 'restore'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                )}
              >
                {confirmModal.type === 'restore'
                  ? 'Yes, Restore Backup'
                  : 'Yes, Overwrite & Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
