import { ReactNode } from 'react';

interface OnboardingLayoutProps {
  children: ReactNode;
  step?: number;
  totalSteps?: number;
}

const OnboardingLayout = ({ children, step, totalSteps }: OnboardingLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress indicator - subtle dots, not a bar */}
      {step && totalSteps && (
        <div className="flex justify-center gap-2 pt-8 pb-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-gentle ${
                i < step ? 'bg-foreground' : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 container-calm">
        {children}
      </div>
    </div>
  );
};

export default OnboardingLayout;
