import React, { useState } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CLASSROOM_SCOPES, DEFAULT_CLIENT_ID_PLACEHOLDER } from '../services/classroomApi';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSaveClientId: (id: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  clientId,
  onSaveClientId,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const [inputVal, setInputVal] = useState(clientId || '');
  const [copiedScopes, setCopiedScopes] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveClientId(inputVal.trim());
    onClose();
  };

  const handleCopyScopes = () => {
    navigator.clipboard.writeText(
      `https://www.googleapis.com/auth/classroom.courses.readonly\nhttps://www.googleapis.com/auth/classroom.coursework.me.readonly\nhttps://www.googleapis.com/auth/classroom.student-submissions.me.readonly`
    );
    setCopiedScopes(true);
    setTimeout(() => setCopiedScopes(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Konfigurasi Google Identity Services & Classroom API
              </h2>
              <p className="text-xs text-slate-500">
                Makarios Christian School • EDUNEXUS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Quick Demo Mode Switcher Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Mode Simulasi / Demo Data Makarios
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Ingin langsung mencoba antarmuka tanpa memasukkan Client ID? Anda dapat mengaktifkan Mode Demo dengan data tugas siswa Makarios Christian School.
              </p>
            </div>
            <button
              onClick={onToggleDemoMode}
              className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
                isDemoMode
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isDemoMode ? 'Mode Demo Aktif' : 'Aktifkan Demo'}
            </button>
          </div>

          {/* Form for OAuth Client ID */}
          <form onSubmit={handleSave} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Google OAuth 2.0 Web Client ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="YOUR_CLIENT_ID_HERE.apps.googleusercontent.com"
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
              >
                Simpan
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Disimpan secara lokal di browser Anda (Local Storage) untuk kemudahan pengujian di localhost/XAMPP/IDX.
            </p>
          </form>

          {/* Google Cloud Console Setup Guide */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Panduan Konfigurasi Google Cloud Console
            </h4>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li>
                <strong>Buat Proyek:</strong> Buka{' '}
                <a
                  href="https://console.cloud.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                >
                  Google Cloud Console <ExternalLink className="w-3 h-3" />
                </a>{' '}
                lalu buat proyek baru (misal: <em>Edunexus-Classroom-Monitor</em>).
              </li>
              <li>
                <strong>Aktifkan API:</strong> Cari dan aktifkan{' '}
                <span className="font-semibold text-slate-800">Google Classroom API</span>.
              </li>
              <li>
                <strong>OAuth Consent Screen:</strong> Pilih tipe <em>Internal</em> (jika memakai Google Workspace sekolah Makarios) atau <em>External</em>.
              </li>
              <li>
                <strong>Kredensial OAuth 2.0 Web Client:</strong> Buat kredensial <em>OAuth client ID</em> tipe <em>Web application</em>.
              </li>
              <li>
                <strong>Authorized JavaScript Origins:</strong> Masukkan URL asal Anda, misalnya:
                <div className="font-mono bg-white p-2 rounded border border-slate-200 mt-1 space-y-1 text-[11px]">
                  <div>http://localhost</div>
                  <div>http://localhost:3000</div>
                  <div>http://localhost/sekolah-app</div>
                </div>
              </li>
            </ol>
          </div>

          {/* Scopes Reference */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                API Scopes yang Dibutuhkan
              </span>
              <button
                type="button"
                onClick={handleCopyScopes}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
              >
                {copiedScopes ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScopes ? 'Tersalin' : 'Salin Scopes'}</span>
              </button>
            </div>
            <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-3 rounded-lg overflow-x-auto space-y-1">
              <div>https://www.googleapis.com/auth/classroom.courses.readonly</div>
              <div>https://www.googleapis.com/auth/classroom.coursework.me.readonly</div>
              <div>https://www.googleapis.com/auth/classroom.student-submissions.me.readonly</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
