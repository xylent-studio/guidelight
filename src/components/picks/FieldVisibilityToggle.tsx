import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FieldVisibilityToggleProps = {
  isVisible: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

/**
 * Eye toggle for controlling field visibility to customers.
 * Used in PickFormModal next to toggleable fields.
 */
export function FieldVisibilityToggle({ 
  isVisible, 
  onToggle, 
  disabled 
}: FieldVisibilityToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={onToggle}
      disabled={disabled}
      title={isVisible ? 'Visible to customers' : 'Hidden from customers'}
    >
      {isVisible ? (
        <Eye size={14} className="text-muted-foreground" />
      ) : (
        <EyeOff size={14} className="text-muted-foreground/50" />
      )}
    </Button>
  );
}
