import { Skeleton } from '@/components/ui/skeleton';

const DiscoveryLoading = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Header skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-40 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>

      {/* Intent badge skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-8 w-48 rounded-full" />
      </div>

      {/* Photo skeleton */}
      <Skeleton className="aspect-[4/5] w-full rounded-lg" />

      {/* Prompt skeletons */}
      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-5 w-full" />
        </div>
        <div className="rounded-lg border border-border p-4 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    </div>
  );
};

export default DiscoveryLoading;
