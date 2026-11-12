import React from 'react';
import { School, CheckCircle2, Clock, AlertTriangle, Award, Printer, X } from 'lucide-react';
import { ConsolidatedTask, Course } from '../utils/classroom-logic';
import { StudentProfile } from '../data/mockClassroomData';

interface PrintReportViewProps {
  student: StudentProfile | null;
  tasks: ConsolidatedTask[];
  courses: Course[];
  onClose: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  student,
  tasks,
  courses,
  onClose,
}) => {
  const printDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-4 sm:p-6 flex justify-center backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 text-slate-900 my-auto print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none">
        {/* Print Action Header (Hidden during actual print) */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 print:hidden">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Pratinjau Lembar Rekapitulasi Tugas Siswa
            </h3>
            <p className="text-xs text-slate-500">
              Siap dicetak atau disimpan sebagai PDF untuk laporan wali murid / sekolah.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold">
              <School className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest text-indigo-700 uppercase">
                EDUNEXUS DASHBOARD SISTEM
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                MAKARIOS CHRISTIAN SCHOOL
              </h1>
              <p className="text-xs text-slate-600">
                Rekapitulasi Tugas Siswa Google Classroom
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-600 space-y-1">
            <p>
              Tanggal Cetak: <span className="font-semibold text-slate-900">{printDate}</span>
            </p>
            <p>
              Pengembang: <span className="font-semibold text-slate-900">Glenn Bolang (PapaUnicorn)</span>
            </p>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-6">
          <div>
            <span className="text-slate-400 block font-medium">Nama Siswa:</span>
            <span className="font-bold text-slate-900 text-sm">{student?.name || 'Siswa Makarios'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Email Akun:</span>
            <span className="font-semibold text-slate-800">{student?.email || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Kelas / Rombel:</span>
            <span className="font-semibold text-slate-800">{student?.grade || 'Kelas XI - IPA 1'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Total Tugas Terdaftar:</span>
            <span className="font-bold text-indigo-700 text-sm">{tasks.length} Tugas</span>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-700 uppercase font-bold text-[11px] bg-slate-100/70">
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Mata Pelajaran</th>
                <th className="py-2.5 px-3">Judul Tugas</th>
                <th className="py-2.5 px-3">Batas Waktu</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Nilai / Poin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task, idx) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{task.courseName}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[240px] truncate">
                    {task.title}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{task.formattedDueDate}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        task.status === 'RETURNED'
                          ? 'bg-blue-100 text-blue-800'
                          : task.status === 'TURNED_IN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : task.status === 'MISSING'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {task.statusLabel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                    {typeof task.assignedGrade === 'number'
                      ? `${task.assignedGrade}/${task.maxPoints ?? 100}`
                      : task.maxPoints !== undefined
                      ? `- / ${task.maxPoints}`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[11px] text-slate-400">
          Dokumen ini digenerate secara otomatis melalui EDUNEXUS Classroom Task Monitor untuk siswa Makarios Christian School.
        </div>
      </div>
    </div>
  );
};
