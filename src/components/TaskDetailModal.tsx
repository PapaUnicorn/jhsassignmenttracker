import React from 'react';
import {
  X,
  ExternalLink,
  Calendar,
  Award,
  BookOpen,
  Info,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { ConsolidatedTask } from '../utils/classroom-logic';

interface TaskDetailModalProps {
  task: ConsolidatedTask | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <BookOpen className="w-3 h-3" />
                {task.courseName}
              </span>
              {task.courseSection && (
                <span className="text-xs text-slate-400">{task.courseSection}</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status & Deadline Banner */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Status Tugas
              </span>
              <div className="flex items-center gap-2">
                {task.status === 'RETURNED' && (
                  <span className="font-bold text-blue-700 flex items-center gap-1.5 text-sm">
                    <Award className="w-4 h-4 text-blue-600" />
                    Dinilai: {task.assignedGrade ?? '-'}/{task.maxPoints ?? 100}
                  </span>
                )}
                {task.status === 'TURNED_IN' && (
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Diserahkan (Turned In)
                  </span>
                )}
                {task.status === 'MISSING' && (
                  <span className="font-bold text-rose-700 flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Terlambat (Missing)
                  </span>
                )}
                {task.status === 'CREATED' && (
                  <span className="font-bold text-amber-700 flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Belum Dikerjakan (Assigned)
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Batas Waktu (Due Date)
              </span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{task.formattedDueDate}</span>
              </div>
            </div>
          </div>

          {/* Description / Instructions */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              Petunjuk Pengerjaan
            </h4>
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {task.description || 'Tidak ada deskripsi tambahan dari pengajar.'}
            </div>
          </div>

          {/* Metadata information */}
          <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
            <p>ID CourseWork: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">{task.id}</code></p>
            <p>ID Kelas: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">{task.courseId}</code></p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Tutup
          </button>

          <a
            href={task.alternateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
          >
            <span>Buka Langsung di Google Classroom</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
