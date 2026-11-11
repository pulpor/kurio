import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-lg bg-[#231611] border border-[#38210F] animate-shimmer relative overflow-hidden ${className}`}
    />
  );
}

export function NFTSkeletonCard() {
  return (
    <div className="flex flex-col bg-[#231611] border border-[#38210F] rounded-2xl overflow-hidden p-4 space-y-4">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="pt-2 border-t border-[#38210F] flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-2.5 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-7 w-16 rounded-md" />
      </div>
    </div>
  );
}
