import React from 'react';
import {
  BookOpen,
  LogOut,
  LogIn,
  Settings,
  RefreshCw,
  Printer,
  Sparkles,
  School,
  ShieldCheck,
} from 'lucide-react';
import { StudentProfile } from '../data/mockClassroomData';

interface HeaderProps {
  student: StudentProfile | null;
  isLoggedIn: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onToggleDemo: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  isLoggedIn,
  isDemoMode,
  isLoading,
  onLogin,
  onLogout,
  onRefresh,
  onOpenSettings,
  onToggleDemo,
  onPrint,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 ring-2 ring-indigo-50 shrink-0">
              <School className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  EDUNEXUS
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate">
                  Makarios Christian School
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate flex items-center gap-2">
                Classroom Task Monitor
                <span className="hidden sm:inline-block text-xs font-normal text-slate-400">
                  v1.2
                </span>
              </h1>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode Indicator & Demo Switcher */}
            <button
              onClick={onToggleDemo}
              title="Ganti Mode Simulasi / Live GIS"
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isDemoMode
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isDemoMode ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mode Demo (Makarios)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Identity Live</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Segarkan data tugas"
              className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Print / Report Button */}
            <button
              onClick={onPrint}
              title="Cetak Rekap Tugas Siswa"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rekap</span>
            </button>

            {/* Google Cloud Client ID Settings */}
            <button
              onClick={onOpenSettings}
              title="Konfigurasi Client ID & Integrasi"
              className="p-2 sm:px-3 sm:py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Konfigurasi</span>
            </button>

            {/* Authentication Button & Profile */}
            {isLoggedIn && student ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {student.name}
                  </span>
                  <span className="text-[11px] text-slate-500 leading-tight">
                    {student.email}
                  </span>
                </div>
                <img
                  src={student.avatarUrl}
                  alt={student.name}
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-500/30 object-cover"
                />
                <button
                  onClick={onLogout}
                  title="Logout dari akun Google"
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 shadow-2xs hover:shadow-xs transition-all active:bg-slate-100"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Masuk dengan Google</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
