import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, User, Star } from 'lucide-react';
import type { Board } from '@/lib/api/boards';

type BoardCardProps = {
  board: Board;
  onClick?: () => void;
};

const typeIcons = {
  auto_store: Store,
  auto_user: User,
  custom: Star,
};

const typeLabels = {
  auto_store: 'Store',
  auto_user: 'Personal',
  custom: 'Custom',
};

export function BoardCard({ board, onClick }: BoardCardProps) {
  const Icon = typeIcons[board.type];
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {typeLabels[board.type]}
            </span>
          </div>
          <Badge variant={board.status === 'published' ? 'default' : 'secondary'}>
            {board.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <CardTitle className="text-lg">{board.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {board.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {board.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

