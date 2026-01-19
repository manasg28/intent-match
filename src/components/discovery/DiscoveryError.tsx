import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DiscoveryErrorProps {
  message: string;
  showProfileLink?: boolean;
}

const DiscoveryError = ({ message, showProfileLink = false }: DiscoveryErrorProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-muted-foreground mb-6 max-w-xs">
        {message}
      </p>
      {showProfileLink && (
        <Button onClick={() => navigate('/create-profile')}>
          Complete Profile
        </Button>
      )}
    </div>
  );
};

export default DiscoveryError;
