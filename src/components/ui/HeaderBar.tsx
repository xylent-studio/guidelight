import { Link } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderBarProps {
  /** Main title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Show avatar on the left */
  avatar?: {
    name: string;
    imageUrl?: string;
    onClick?: () => void;
  };
  /** Show back button instead of avatar */
  showBackButton?: boolean;
  /** Back button click handler or link destination */
  onBack?: () => void | string;
  /** Right side actions */
  rightActions?: React.ReactNode;
  /** Overflow menu items */
  overflowMenu?: Array<{
    label: string;
    onClick: () => void;
    destructive?: boolean;
  }>;
  /** Class name for styling */
  className?: string;
}

/**
 * Flexible header bar component.
 * Used across My picks, Show to customer, Team, and Display Mode.
 */
export function HeaderBar({
  title,
  subtitle,
  avatar,
  showBackButton,
  onBack,
  rightActions,
  overflowMenu,
  className = '',
}: HeaderBarProps) {
  const BackButton = () => {
    if (typeof onBack === 'string') {
      return (
        <Link to={onBack}>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
      );
    }
    return (
      <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Back</span>
      </Button>
    );
  };

  const Avatar = () => {
    if (!avatar) return null;
    
    const initials = avatar.name.charAt(0).toUpperCase();
    
    const avatarElement = (
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold shrink-0">
        {avatar.imageUrl ? (
          <img 
            src={avatar.imageUrl} 
            alt={avatar.name} 
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
    );

    if (avatar.onClick) {
      return (
        <button onClick={avatar.onClick} className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full">
          {avatarElement}
        </button>
      );
    }

    return avatarElement;
  };

  return (
    <header className={`sticky top-0 z-50 bg-card border-b border-border ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        {/* Left side: Back button or Avatar */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBackButton ? <BackButton /> : <Avatar />}
          
          {/* Title and subtitle */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right side: Actions and overflow menu */}
        <div className="flex items-center gap-2 shrink-0">
          {rightActions}
          
          {overflowMenu && overflowMenu.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {overflowMenu.map((item, idx) => (
                  <div key={item.label}>
                    {idx > 0 && item.destructive && <DropdownMenuSeparator />}
                    <DropdownMenuItem 
                      onClick={item.onClick}
                      className={item.destructive ? 'text-destructive focus:text-destructive' : ''}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

export default HeaderBar;

