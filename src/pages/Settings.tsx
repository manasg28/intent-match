import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, MapPin } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="container-calm space-y-8">
        <h1>Settings</h1>

        <div className="space-y-4">
          {/* Account info */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="font-medium text-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Edit profile link */}
          <button
            onClick={() => navigate('/create-profile')}
            className="w-full rounded-xl border border-border bg-card p-5 shadow-soft text-left transition-gentle hover:bg-secondary/30"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Edit Profile</span>
              <span className="text-muted-foreground">→</span>
            </div>
          </button>

          {/* Privacy notice */}
          <div className="rounded-xl bg-secondary/50 p-5">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Your privacy</p>
                <p className="text-sm text-muted-foreground">
                  We never track your live location, activity, or send notifications.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="pt-4">
          <Button
            variant="ghost"
            className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
            disabled={loading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {loading ? 'Signing out...' : 'Sign Out'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
