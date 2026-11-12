import React from 'react';
import {
  ExternalLink,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { ConsolidatedTask } from '../utils/classroom-logic';

interface TaskCardProps {
  task: ConsolidatedTask;
  onOpenDetails?: (task: ConsolidatedTask) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onOpenDetails }) => {
  // Status-specific badges & accents
  const renderStatusBadge = () => {
    switch (task.status) {
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Dinilai
              {typeof task.assignedGrade === 'number'
                ? `: ${task.assignedGrade}${task.maxPoints ? `/${task.maxPoints}` : ''}`
                : ''}
            </span>
          </span>
        );
      case 'TURNED_IN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Diserahkan</span>
          </span>
        );
      case 'MISSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Terlambat (Missing)</span>
          </span>
        );
      case 'RECLAIMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Ditarik Kembali</span>
          </span>
        );
      case 'CREATED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Belum Dikerjakan</span>
          </span>
        );
    }
  };

  // Color bar indicator on card top based on course
  const getCoursePillColor = (courseName: string) => {
    if (courseName.includes('Matematika')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (courseName.includes('Fisika')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    if (courseName.includes('Agama')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (courseName.includes('English')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (courseName.includes('Informatika')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (courseName.includes('Biologi')) return 'bg-teal-50 text-teal-700 border-teal-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Course and Status Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getCoursePillColor(
              task.courseName
            )}`}
          >
            <BookOpen className="w-3 h-3" />
            <span className="truncate max-w-[170px] sm:max-w-[200px]" title={task.courseName}>
              {task.courseName}
            </span>
          </span>

          <div className="shrink-0">{renderStatusBadge()}</div>
        </div>

        {/* Task Title */}
        <h3
          onClick={() => onOpenDetails?.(task)}
          className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
        >
          {task.title}
        </h3>

        {/* Short Description */}
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 mt-2">
        {/* Due Date & Points Row */}
        <div className="flex items-center justify-between text-xs mb-3.5">
          <div
            className={`flex items-center gap-1.5 font-medium ${
              task.status === 'MISSING'
                ? 'text-rose-600 font-semibold'
                : 'text-slate-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{task.formattedDueDate}</span>
          </div>

          {task.maxPoints !== undefined && (
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
              {task.maxPoints} Poin
            </span>
          )}
        </div>

        {/* Action Button: Open in Google Classroom */}
        <div className="flex items-center gap-2">
          <a
            href={task.alternateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-colors"
          >
            <span>Buka di Classroom</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {onOpenDetails && (
            <button
              onClick={() => onOpenDetails(task)}
              className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              Detail
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
