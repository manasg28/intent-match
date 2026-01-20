import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Welcome = () => {
  const [showTrust, setShowTrust] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-12 text-center">
        {/* App identity */}
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Intentional
          </h1>
          <p className="text-muted-foreground">
            Dating with purpose
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button asChild className="w-full h-12 text-base">
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full h-12 text-base">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>

        {/* Trust microcopy - shown once */}
        {!showTrust ? (
          <button
            onClick={() => setShowTrust(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-gentle"
          >
            How we're different
          </button>
        ) : (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>No live location.</p>
            <p>No activity tracking.</p>
            <p>No notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Welcome;
