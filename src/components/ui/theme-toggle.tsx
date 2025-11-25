import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

const modes: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark', icon: Moon, label: 'Dark' },
];

/**
 * Subtle 3-way theme toggle for light/system/dark modes.
 * Designed for footer placement.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full p-0.5',
        'bg-bg-elevated border border-border-subtle',
        className
      )}
      role="radiogroup"
      aria-label="Theme selection"
    >
      {modes.map(({ value, icon: Icon, label }) => {
        const isSelected = mode === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={label}
            title={label}
            onClick={() => setMode(value)}
            className={cn(
              'p-1.5 rounded-full transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-outline',
              isSelected
                ? 'bg-primary-soft text-text-default'
                : 'text-text-muted hover:text-text-default hover:bg-bg-surface'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}

