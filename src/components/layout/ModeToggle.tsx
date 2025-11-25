import { Users, Pencil, type LucideIcon } from 'lucide-react';
import { modeToggle } from '@/lib/copy';
import { cn } from '@/lib/utils';

export type AppMode = 'customer' | 'staff';

interface ModeToggleProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

const MODES: Array<{ id: AppMode; label: string; description: string; icon: LucideIcon }> = [
  {
    id: 'customer',
    label: modeToggle.customer.title,
    description: modeToggle.customer.description,
    icon: Users,
  },
  {
    id: 'staff',
    label: modeToggle.staff.title,
    description: modeToggle.staff.description,
    icon: Pencil,
  },
];

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="tablist" aria-label="Guidelight app modes">
      {MODES.map(({ id, label, description, icon: Icon }) => {
        const isActive = id === mode;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            role="tab"
            aria-selected={isActive}
            className={cn(
              'relative flex flex-col items-start text-left h-auto py-4 px-5 gap-1',
              'rounded-lg border transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-outline',
              isActive
                ? 'bg-primary-soft border-chip-selected-border text-text-default'
                : 'bg-bg-surface border-border-subtle text-text-muted hover:bg-bg-elevated hover:text-text-default'
            )}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-primary" />
            )}
            <span className="font-semibold text-base flex items-center gap-2">
              <Icon size={18} />
              {label}
            </span>
            <span className="text-sm font-normal opacity-90">{description}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ModeToggle;
