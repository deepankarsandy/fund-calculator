import { User } from 'lucide-react'
import { useUserProfile } from '@/lib/userProfileStorage'
import { navigateToProfile, getCurrentRoute } from '@/lib/router'
import { cn } from '@/lib/cn'

interface ProfileHeaderButtonProps {
  onClick?: () => void
  className?: string
}

export function ProfileHeaderButton({ onClick, className }: ProfileHeaderButtonProps) {
  const { profile, isConfigured } = useUserProfile()
  const isProfileActive = getCurrentRoute().page === 'profile'

  const displayName = profile.name.trim() || 'Profile'

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigateToProfile()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'group relative text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs',
        isProfileActive
          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
          : isConfigured
            ? 'border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 hover:bg-muted'
            : 'border-border hover:bg-muted text-foreground',
        className
      )}
      title="User Profile & Baseline Calculator Defaults (DOB, Retirement, Sector Inflation, Taxes)"
    >
      <div className="relative">
        <User
          className={cn(
            'w-3.5 h-3.5',
            isProfileActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'
          )}
        />
        {isConfigured && !isProfileActive && (
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-card" />
        )}
      </div>
      <span className="hidden sm:inline font-bold">{displayName}</span>
    </button>
  )
}
