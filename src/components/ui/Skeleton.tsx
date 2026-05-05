export function SkeletonCard() {
  return (
    <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="h-5 bg-gray-800/50 rounded w-1/3 mb-3" />
          <div className="h-4 bg-gray-800/50 rounded w-1/2" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-800/50 rounded w-16" />
          <div className="h-6 bg-gray-800/50 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-6 animate-pulse">
      <div className="w-10 h-10 bg-gray-800/50 rounded-lg mb-4" />
      <div className="h-6 bg-gray-800/50 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-800/50 rounded w-2/3" />
    </div>
  );
}

export function SkeletonLine() {
  return <div className="h-4 bg-gray-800/50 rounded animate-pulse w-full" />;
}
