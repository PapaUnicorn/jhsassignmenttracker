/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Makarios Christian School - Junior High School
 * Classroom Assignment Tracker
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ExternalLink,
  LogIn,
  LogOut,
  Loader2,
  Calendar,
  AlertCircle,
  Sparkles,
  KeyRound,
  ArrowUp,
  ArrowDown,
  Filter,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import {
  ConsolidatedTask,
  filterAndSortClassroomTasks,
  DeadlineSortOrder,
} from './utils/classroom-logic';
import {
  fetchLiveGoogleClassroomData,
  fetchSimulatedClassroomData,
  fetchGoogleUserProfile,
} from './services/classroomApi';
import {
  executeGoogleLogin,
  logoutUser,
  setAccessToken as cacheAccessToken,
  getActiveClientId,
  setActiveClientId,
  DEFAULT_OAUTH_CLIENT_ID,
} from './services/auth';
import { StudentProfile } from './data/mockClassroomData';

export default function App() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [tasks, setTasks] = useState<ConsolidatedTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Filters & Sorting state
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortByDeadline, setSortByDeadline] = useState<DeadlineSortOrder>('RECENT_FIRST');

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showOriginMismatchGuide, setShowOriginMismatchGuide] = useState<boolean>(false);
  const [copiedOrigin, setCopiedOrigin] = useState<boolean>(false);
  const [showManualTokenInput, setShowManualTokenInput] = useState<boolean>(false);
  const [manualToken, setManualToken] = useState<string>('');

  const [currentClientId, setCurrentClientId] = useState<string>(getActiveClientId());
  const [tempClientId, setTempClientId] = useState<string>(getActiveClientId());
  const [isEditingClientId, setIsEditingClientId] = useState<boolean>(false);
  const [copiedSharedOrigin, setCopiedSharedOrigin] = useState<boolean>(false);
  const sharedOrigin = 'https://ais-pre-szdq4klnfap6zh5enbuoxg-77765964593.asia-southeast1.run.app';

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopySharedOrigin = () => {
    navigator.clipboard.writeText(sharedOrigin);
    setCopiedSharedOrigin(true);
    setTimeout(() => setCopiedSharedOrigin(false), 2500);
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveClientId(tempClientId);
    setCurrentClientId(tempClientId.trim() || DEFAULT_OAUTH_CLIENT_ID);
    setIsEditingClientId(false);
  };

  const handleResetClientId = () => {
    setActiveClientId('');
    setTempClientId(DEFAULT_OAUTH_CLIENT_ID);
    setCurrentClientId(DEFAULT_OAUTH_CLIENT_ID);
    setIsEditingClientId(false);
  };

  /**
   * Load real data from Google Classroom API
   */
  const loadClassroomData = useCallback(async (token: string) => {
    setIsLoading(true);
    setStatusMessage('Mengambil data mata pelajaran dan tugas dari Google Classroom akun Anda...');
    setErrorMessage(null);
    setShowOriginMismatchGuide(false);

    try {
      const [profile, liveData] = await Promise.all([
        fetchGoogleUserProfile(token),
        fetchLiveGoogleClassroomData(token, (msg) => setStatusMessage(msg)),
      ]);

      setStudent(profile);
      setTasks(liveData.tasks);
      setIsLoggedIn(true);
    } catch (err: any) {
      console.error('Error fetching live Classroom data:', err);
      setErrorMessage(
        err.message || 'Gagal mengambil data dari Google Classroom. Pastikan izin akses disetujui.'
      );
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  }, []);

  /**
   * Optional: Load mock demonstration data on explicit user click
   */
  const handleLoadMockDemo = async () => {
    setIsLoading(true);
    setStatusMessage('Memuat contoh data simulasi Makarios...');
    setErrorMessage(null);
    setShowOriginMismatchGuide(false);
    try {
      const simulated = await fetchSimulatedClassroomData();
      setTasks(simulated.tasks);
      setStudent({
        name: 'Glenn Bolang (Contoh Simulasi)',
        email: 'glenn.bolang@makarios.sch.id',
        school: 'Makarios Christian School - Junior High School',
        grade: 'Junior High School',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      });
      setIsLoggedIn(true);
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  /**
   * Google Sign-In Handler
   */
  const handleLoginClick = async () => {
    setIsLoading(true);
    setStatusMessage('Membuka dialog login Google...');
    setErrorMessage(null);
    setShowOriginMismatchGuide(false);

    await executeGoogleLogin(
      async (token: string, user) => {
        setAccessToken(token);
        if (user) {
          setStudent({
            name: user.displayName || 'Siswa Makarios',
            email: user.email || 'siswa@makarios.sch.id',
            school: 'Makarios Christian School - Junior High School',
            grade: 'Junior High School',
            avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
          });
        }
        await loadClassroomData(token);
      },
      (err: Error) => {
        setIsLoading(false);
        setStatusMessage('');

        if (err.message === 'USER_CLOSED_POPUP') {
          // If the popup was closed, suggest the origin mismatch guide in case Google blocked it
          setShowOriginMismatchGuide(true);
          setErrorMessage(
            'Jendela login ditutup. Jika Google menampilkan "Error 400: origin_mismatch" di jendela tersebut, silakan ikuti panduan di bawah untuk mendaftarkan URL asal ini ke Google Cloud Console.'
          );
          return;
        }

        if (err.message === 'ORIGIN_MISMATCH' || err.message.includes('origin_mismatch')) {
          setShowOriginMismatchGuide(true);
          setErrorMessage(
            'Error 400: origin_mismatch — Domain URL ini belum terdaftar di Google Cloud Console pada OAuth Client ID Anda.'
          );
          return;
        }

        setErrorMessage(err.message || 'Login Google dibatalkan atau gagal.');
      }
    );
  };

  /**
   * Copy current origin to clipboard
   */
  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2500);
  };

  /**
   * Handle Manual Token submission (fallback for strict environments)
   */
  const handleApplyManualToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    const cleanToken = manualToken.trim();
    cacheAccessToken(cleanToken);
    setAccessToken(cleanToken);
    setShowManualTokenInput(false);
    await loadClassroomData(cleanToken);
  };

  /**
   * Logout Handler
   */
  const handleLogout = () => {
    logoutUser(() => {
      setAccessToken(null);
      setIsLoggedIn(false);
      setStudent(null);
      setTasks([]);
      setErrorMessage(null);
      setShowOriginMismatchGuide(false);
    });
  };

  /**
   * Toggle Deadline Sorting (Recent First vs Oldest First)
   */
  const handleToggleDeadlineSort = () => {
    setSortByDeadline((prev) => (prev === 'RECENT_FIRST' ? 'OLDEST_FIRST' : 'RECENT_FIRST'));
  };

  // Filter & sort tasks by date range, status, and deadline order
  const displayedTasks = useMemo(() => {
    return filterAndSortClassroomTasks(tasks, {
      dateRange: dateFilter,
      statusFilter,
      sortByDeadline,
    });
  }, [tasks, dateFilter, statusFilter, sortByDeadline]);

  // Status Badge Helper
  const renderStatusBadge = (task: ConsolidatedTask) => {
    switch (task.status) {
      case 'RETURNED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Dinilai
            {typeof task.assignedGrade === 'number'
              ? ` (${task.assignedGrade}/${task.maxPoints ?? 100})`
              : ''}
          </span>
        );
      case 'TURNED_IN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Diserahkan
          </span>
        );
      case 'MISSING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            Terlambat
          </span>
        );
      case 'CREATED':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Belum Dikerjakan
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 sm:p-10 max-w-6xl mx-auto font-sans">
      {/* 1. Header: Makarios Christian School - Junior High School / Classroom Assignment Tracker / Name */}
      <header className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
              Makarios Christian School - Junior High School
            </h2>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Classroom Assignment Tracker
            </h1>
            <div className="mt-2 text-sm text-slate-700">
              <span className="font-medium text-slate-500">Name: </span>
              {student ? (
                <>
                  <strong className="font-semibold text-slate-900">{student.name}</strong>
                  {student.email && (
                    <span className="text-slate-400 text-xs ml-2">({student.email})</span>
                  )}
                </>
              ) : (
                <span className="text-slate-500 italic">Belum masuk (Silakan Sign in dengan akun Google)</span>
              )}
            </div>
          </div>

          {/* Login / Logout button */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoginClick}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors disabled:opacity-50"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign in with Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowOriginMismatchGuide(!showOriginMismatchGuide)}
                  title="Klik jika menemui Error 400: origin_mismatch di Google"
                  className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-md text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Solusi Error 400</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Origin Mismatch Resolution Guide Banner */}
        {showOriginMismatchGuide && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="font-bold text-sm text-amber-900 block mb-1">
                  Cara Mengatasi Error 400: origin_mismatch
                </strong>
                <p className="leading-relaxed text-amber-800">
                  Google memblokir login akun <strong>helena.suzane@sekolahmakarios.id</strong> karena URL domain web ini belum dimasukkan ke daftar <em>Authorized JavaScript origins</em> di Google Cloud Console Client ID Anda.
                </p>
              </div>
              <button
                onClick={() => setShowOriginMismatchGuide(false)}
                className="text-amber-600 hover:text-amber-900 font-bold px-2 py-0.5 text-xs"
              >
                Tutup
              </button>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-amber-200 space-y-3">
              <div>
                <span className="font-semibold text-slate-800 block mb-1">
                  1. Daftarkan KEDUA URL ini di Authorized JavaScript origins:
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-500 w-16 shrink-0">Dev URL:</span>
                    <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded font-mono text-xs flex-1 truncate select-all border border-slate-200">
                      {currentOrigin}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyOrigin}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs flex items-center gap-1 shrink-0 transition-colors"
                    >
                      {copiedOrigin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedOrigin ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-500 w-16 shrink-0">Share URL:</span>
                    <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded font-mono text-xs flex-1 truncate select-all border border-slate-200">
                      {sharedOrigin}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySharedOrigin}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs flex items-center gap-1 shrink-0 transition-colors"
                    >
                      {copiedSharedOrigin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSharedOrigin ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Client ID Info */}
              <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-slate-700 truncate">
                  <span className="text-slate-500 font-medium">OAuth Client ID aktif: </span>
                  <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-semibold truncate">
                    {currentClientId}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingClientId(!isEditingClientId)}
                  className="text-indigo-600 hover:underline font-semibold text-xs shrink-0 self-start sm:self-auto"
                >
                  {isEditingClientId ? 'Batal Ganti' : 'Ganti Client ID jika berbeda'}
                </button>
              </div>

              {/* Edit Client ID Form */}
              {isEditingClientId && (
                <form onSubmit={handleSaveClientId} className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-2">
                  <p className="text-[11px] text-slate-600">
                    Jika di Google Cloud Console Anda mengedit/membuat OAuth Client ID yang berbeda, tempelkan Client ID tersebut di sini:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempClientId}
                      onChange={(e) => setTempClientId(e.target.value)}
                      placeholder="667023974320-xxxx.apps.googleusercontent.com"
                      className="flex-1 px-2.5 py-1 font-mono text-xs border border-slate-300 rounded bg-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded text-xs"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={handleResetClientId}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs"
                    >
                      Reset Default
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Troubleshooting Checklist for "URL sudah ada tapi masih Error 400" */}
            <div className="p-3 bg-amber-100/60 rounded-lg border border-amber-300/80 space-y-2">
              <strong className="text-amber-900 font-bold block text-xs">
                💡 URL sudah ditambahkan tapi Google masih menampilkan "Error 400: origin_mismatch"? Periksa 4 hal ini:
              </strong>
              <ul className="space-y-1.5 list-disc list-inside text-amber-950 text-xs pl-1 leading-relaxed">
                <li>
                  <strong>Pastikan kolom yang diisi adalah "Authorized JavaScript origins"</strong> (bagian paling atas), <u>BUKAN</u> di <em>Authorized redirect URIs</em> (bagian bawah).
                </li>
                <li>
                  <strong>Pastikan Anda mengedit Client ID yang tepat:</strong> Buka Client ID <code>{currentClientId}</code> di{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials?project=gen-lang-client-0367272811"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 underline font-semibold"
                  >
                    GCP Console Credentials
                  </a>.
                </li>
                <li>
                  <strong>Pastikan TIDAK ada tanda garis miring (<code>/</code>) di akhir URL</strong> (contoh salah: <code>...run.app/</code>).
                </li>
                <li>
                  <strong>Waktu propagasi Google Server (2 - 5 menit):</strong> Perubahan di Google Cloud Console memerlukan waktu sinkronisasi global. Tunggu 2-3 menit, lalu buka halaman ini di <strong>Tab Incognito / Private Window</strong> atau tekan <code>Ctrl + F5</code> dan klik <strong>Sign in with Google</strong> lagi.
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowManualTokenInput(!showManualTokenInput)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Atau Masukkan Access Token Manual (Langsung Masuk)</span>
              </button>
              <button
                type="button"
                onClick={handleLoadMockDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-200/60 hover:bg-amber-200 text-amber-900 border border-amber-300 font-semibold text-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Lihat Contoh Simulasi Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Standard Error notification banner */}
        {errorMessage && !showOriginMismatchGuide && (
          <div className="mt-4 p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="font-bold block mb-0.5">Pemberitahuan Sistem:</strong>
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-800 text-xs font-semibold px-2 py-0.5"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Manual token input form */}
        {showManualTokenInput && (
          <form
            onSubmit={handleApplyManualToken}
            className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2"
          >
            <label className="block font-semibold text-slate-700">
              Tempelkan OAuth Access Token Google (dari OAuth Playground atau gcloud):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="ya29.a0AcM612..."
                className="flex-1 px-3 py-1.5 font-mono text-xs border border-slate-300 rounded bg-white text-slate-900"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded"
              >
                Gunakan Token
              </button>
            </div>
          </form>
        )}
      </header>

      {/* 2. Filters & Sort Controls: Date Filter, Assignment Status Filter, and Deadline Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Filter: (all, this month) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Date:
            </span>
            <div className="inline-flex rounded-md shadow-2xs">
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1.5 rounded-l-md text-xs font-semibold transition-colors border border-slate-200 ${
                  dateFilter === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDateFilter('this_month')}
                className={`px-3 py-1.5 rounded-r-md text-xs font-semibold transition-colors border border-l-0 border-slate-200 ${
                  dateFilter === 'this_month'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Assignment Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Status (All)</option>
              <option value="CREATED">Belum Dikerjakan</option>
              <option value="TURNED_IN">Diserahkan</option>
              <option value="RETURNED">Dinilai</option>
              <option value="MISSING">Terlambat</option>
            </select>
          </div>
        </div>

        {/* Deadline Sort Control */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            Urutan Deadline:
          </span>
          <button
            onClick={handleToggleDeadlineSort}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors"
          >
            {sortByDeadline === 'RECENT_FIRST' ? (
              <>
                <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Paling Recent (Terdekat → Lama)</span>
              </>
            ) : (
              <>
                <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                <span>Paling Lama (Terjauh → Recent)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Daftar Semua Assignments (Tabel: Subject, Description with links, Deadline, Assignment Status) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Daftar Semua Assignments
          </h3>
          {tasks.length > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {displayedTasks.length} dari {tasks.length} tugas
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 text-sm gap-3 border border-slate-200 rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>{statusMessage || 'Memuat data tugas Google Classroom...'}</span>
          </div>
        ) : !isLoggedIn && tasks.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50">
            <p className="text-sm font-medium text-slate-700 mb-1">
              Anda belum masuk ke akun Google Anda.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
              Klik tombol <strong>"Sign in with Google"</strong> untuk menghubungkan akun Google Classroom Anda dan menampilkan tugas-tugas asli Anda.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleLoginClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk Sekarang</span>
              </button>
              <button
                onClick={handleLoadMockDemo}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Lihat Contoh Simulasi</span>
              </button>
            </div>
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm space-y-2">
            <p>Tidak ada tugas yang cocok dengan filter tanggal atau status yang dipilih.</p>
            {(statusFilter !== 'ALL' || dateFilter !== 'all') && (
              <button
                onClick={() => {
                  setDateFilter('all');
                  setStatusFilter('ALL');
                }}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-xs">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 w-1/4">Subject</th>
                  <th className="py-3 px-4 w-2/5">Description</th>
                  <th
                    onClick={handleToggleDeadlineSort}
                    title="Klik untuk mengubah urutan deadline"
                    className="py-3 px-4 w-1/5 cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Deadline</span>
                      {sortByDeadline === 'RECENT_FIRST' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 w-1/6">Assignment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Subject */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 align-top">
                      {task.courseName}
                    </td>

                    {/* Description (also give links if possible and exist) */}
                    <td className="py-3.5 px-4 text-slate-700 align-top">
                      <div className="font-semibold text-slate-900 mb-1">
                        {task.title}
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-600 line-clamp-3 mb-2 leading-relaxed whitespace-pre-wrap">
                          {task.description}
                        </p>
                      )}
                      {task.alternateLink && (
                        <a
                          href={task.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          <span>Buka di Google Classroom</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>

                    {/* Deadline */}
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-medium align-top whitespace-nowrap">
                      {task.formattedDueDate}
                    </td>

                    {/* Assignment Status */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      {renderStatusBadge(task)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
