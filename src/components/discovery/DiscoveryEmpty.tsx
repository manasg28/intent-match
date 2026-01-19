import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiscoveryEmptyProps {
  onRefresh: () => void;
  isLoading: boolean;
}

const DiscoveryEmpty = ({ onRefresh, isLoading }: DiscoveryEmptyProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <span className="text-2xl">✨</span>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        No more profiles
      </h2>
      <p className="text-muted-foreground mb-6 max-w-xs">
        You've seen everyone with your intent for now. Check back later for new people.
      </p>
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};

export default DiscoveryEmpty;
