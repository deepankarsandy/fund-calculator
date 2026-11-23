import { create } from 'zustand'

export interface HeaderConfig {
  title: string
  subtitle: string
  currentActive?: string
  showPrivateBadge: boolean
  showStepper?: boolean
}

export const DEFAULT_PAGE_HEADERS: Record<string, HeaderConfig> = {
  home: {
    title: 'Fund Calculator',
    subtitle: 'Retirement & Financial Planning',
    currentActive: undefined,
    showPrivateBadge: true,
    showStepper: false,
  },
  calculator: {
    title: 'Fund Calculator',
    subtitle: 'Retirement Fund Calculator · Lifetime Corpus Modeling',
    currentActive: 'fund',
    showPrivateBadge: true,
    showStepper: true,
  },
  sip: {
    title: 'Fund Calculator',
    subtitle: 'Financial Planning Suite · SIP & SWP Plans',
    currentActive: 'sip',
    showPrivateBadge: true,
    showStepper: false,
  },
  investment: {
    title: 'Fund Calculator',
    subtitle: 'Financial Planning Suite · Investment & Policy Returns',
    currentActive: 'investment',
    showPrivateBadge: true,
    showStepper: false,
  },
  fd: {
    title: 'Fund Calculator',
    subtitle: 'Financial Planning Suite · Fixed Deposit (FD) & PPF',
    currentActive: 'fd',
    showPrivateBadge: true,
    showStepper: false,
  },
  interest: {
    title: 'Fund Calculator',
    subtitle: 'Financial Planning Suite · Loan & EMI Plans',
    currentActive: 'interest',
    showPrivateBadge: true,
    showStepper: false,
  },
  profile: {
    title: 'Fund Calculator',
    subtitle: 'User Profile & Calculator Defaults (DOB, Retirement, Inflation)',
    currentActive: 'profile',
    showPrivateBadge: true,
    showStepper: false,
  },
  'export-import': {
    title: 'Fund Calculator',
    subtitle: 'Data Management · Export, Import & Restore Calculator Data',
    currentActive: 'export-import',
    showPrivateBadge: true,
    showStepper: false,
  },
  logic: {
    title: 'Fund Calculator',
    subtitle: 'Features & Calculation Logic · Mathematical Formulations',
    currentActive: 'logic',
    showPrivateBadge: false,
    showStepper: false,
  },
}

interface HeaderStoreState extends HeaderConfig {
  setHeaderForPage: (page: string) => void
  setHeaderConfig: (config: Partial<HeaderConfig>) => void
  resetHeader: () => void
}

export const useHeaderStore = create<HeaderStoreState>((set) => ({
  ...DEFAULT_PAGE_HEADERS.home,
  setHeaderForPage: (page: string) => {
    const config = DEFAULT_PAGE_HEADERS[page] || DEFAULT_PAGE_HEADERS.home
    set({ ...config })
  },
  setHeaderConfig: (config) => set((state) => ({ ...state, ...config })),
  resetHeader: () => set({ ...DEFAULT_PAGE_HEADERS.home }),
}))
