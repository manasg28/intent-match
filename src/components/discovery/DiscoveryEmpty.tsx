const DiscoveryEmpty = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">
          That's everyone for now.
        </p>
        <p className="text-muted-foreground">
          Check back later.
        </p>
      </div>
    </div>
  );
};

export default DiscoveryEmpty;
