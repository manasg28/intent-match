import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Welcome = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome</h1>
          <p className="text-muted-foreground">
            Find meaningful connections
          </p>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;