import { Button } from '@/components/ui/button';
import { Users, Pencil, type LucideIcon } from 'lucide-react';
import { modeToggle } from '@/lib/copy';

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
      {MODES.map(({ id, label, description, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          variant={id === mode ? 'default' : 'outline'}
          size="lg"
          onClick={() => onChange(id)}
          role="tab"
          aria-selected={id === mode}
          className="flex flex-col items-start text-left h-auto py-4 px-5 gap-1"
        >
          <span className="font-semibold text-base flex items-center gap-2">
            <Icon size={18} />
            {label}
          </span>
          <span className="text-sm font-normal opacity-90">{description}</span>
        </Button>
      ))}
    </div>
  );
}

export default ModeToggle;
