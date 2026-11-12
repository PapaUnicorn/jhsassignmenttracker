import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  GraduationCap,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import { ConsolidatedTask } from '../utils/classroom-logic';

interface StatsOverviewProps {
  tasks: ConsolidatedTask[];
  onSelectStatusFilter?: (status: string) => void;
  activeStatusFilter: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  tasks,
  onSelectStatusFilter,
  activeStatusFilter,
}) => {
  const total = tasks.length;
  const turnedIn = tasks.filter((t) => t.status === 'TURNED_IN').length;
  const returned = tasks.filter((t) => t.status === 'RETURNED').length;
  const missing = tasks.filter((t) => t.status === 'MISSING').length;
  const created = tasks.filter((t) => t.status === 'CREATED' || t.status === 'RECLAIMED').length;

  const completed = turnedIn + returned;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate average score for returned tasks
  const gradedTasks = tasks.filter(
    (t) => t.status === 'RETURNED' && typeof t.assignedGrade === 'number'
  );
  const averageGrade =
    gradedTasks.length > 0
      ? (
          gradedTasks.reduce((acc, curr) => acc + (curr.assignedGrade || 0), 0) /
          gradedTasks.length
        ).toFixed(1)
      : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Assignments */}
      <button
        onClick={() => onSelectStatusFilter?.('ALL')}
        className={`text-left p-4 rounded-xl border transition-all ${
          activeStatusFilter === 'ALL'
            ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-200'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Tugas
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center">
            <ListTodo className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">tugas aktif</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>{completionPercentage}% terselesaikan</span>
        </div>
      </button>

      {/* 2. Diserahkan & Selesai */}
      <button
        onClick={() => onSelectStatusFilter?.('COMPLETED')}
        className={`text-left p-4 rounded-xl border transition-all ${
          activeStatusFilter === 'COMPLETED' || activeStatusFilter === 'TURNED_IN' || activeStatusFilter === 'RETURNED'
            ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-200'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Selesai / Dinilai
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{completed}</span>
          <span className="text-xs text-emerald-600 font-medium">
            ({turnedIn} diserahkan, {returned} dinilai)
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </button>

      {/* 3. Belum Dikerjakan (Assigned) */}
      <button
        onClick={() => onSelectStatusFilter?.('CREATED')}
        className={`text-left p-4 rounded-xl border transition-all ${
          activeStatusFilter === 'CREATED'
            ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-200'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Belum Selesai
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">{created}</span>
          <span className="text-xs text-amber-600 font-medium">perlu dikerjakan</span>
        </div>
        <div className="mt-3 text-xs text-amber-700 font-medium">
          Tenggat waktu aktif
        </div>
      </button>

      {/* 4. Terlambat / Missing */}
      <button
        onClick={() => onSelectStatusFilter?.('MISSING')}
        aria-label="Filter status terlambat"
        id="stats-card-missing"
        className={`text-left p-4 rounded-xl border transition-all ${
          activeStatusFilter === 'MISSING'
            ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-200'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
            Terlambat (Missing)
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-100/80 text-rose-700 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-700">{missing}</span>
          <span className="text-xs text-rose-600 font-medium">melewati deadline</span>
        </div>
        <div className="mt-3 text-xs text-rose-600 font-medium flex items-center gap-1">
          {averageGrade ? (
            <span className="text-slate-600">
              Rata-rata Nilai:{' '}
              <strong className="text-indigo-600 font-bold">{averageGrade}</strong>
            </span>
          ) : (
            <span>Perhatian segera</span>
          )}
        </div>
      </button>
    </div>
  );
};
