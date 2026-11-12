import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSkeletonProps {
  statusMessage?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ statusMessage }) => {
  return (
    <div className="space-y-6 animate-pulse">
      {statusMessage && (
        <div className="bg-indigo-50 border border-indigo-200/80 rounded-xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-indigo-900">
            {statusMessage}
          </span>
        </div>
      )}

      {/* Grid of skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 bg-slate-200 rounded w-28" />
              <div className="h-5 bg-slate-200 rounded-full w-20" />
            </div>
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3.5 bg-slate-100 rounded w-full" />
              <div className="h-3.5 bg-slate-100 rounded w-5/6" />
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="h-4 bg-slate-100 rounded w-24" />
              <div className="h-7 bg-slate-200 rounded w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
