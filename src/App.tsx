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
  ExternalLink as NewTabIcon,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import {
  ConsolidatedTask,
  filterByDateRange,
} from './utils/classroom-logic';
import {
  fetchLiveGoogleClassroomData,
  fetchSimulatedClassroomData,
  fetchGoogleUserProfile,
} from './services/classroomApi';
import {
  triggerSynchronousGisLogin,
  logoutUser,
  setAccessToken as cacheAccessToken,
} from './services/auth';
import { StudentProfile } from './data/mockClassroomData';

export default function App() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [tasks, setTasks] = useState<ConsolidatedTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month'>('all');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showManualTokenInput, setShowManualTokenInput] = useState<boolean>(false);
  const [manualToken, setManualToken] = useState<string>('');

  /**
   * Load real data from Google Classroom API
   */
  const loadClassroomData = useCallback(async (token: string) => {
    setIsLoading(true);
    setStatusMessage('Mengambil data mata pelajaran dan tugas dari Google Classroom akun Anda...');
    setErrorMessage(null);

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
   * Synchronous Login Trigger:
   * Called immediately inside the click event to avoid browser popup blocker restrictions.
   */
  const handleLoginClick = () => {
    setIsLoading(true);
    setStatusMessage('Membuka dialog persetujuan Google...');
    setErrorMessage(null);

    const triggered = triggerSynchronousGisLogin(
      async (token: string) => {
        setAccessToken(token);
        await loadClassroomData(token);
      },
      (err: Error) => {
        setIsLoading(false);
        setStatusMessage('');
        if (err.message === 'USER_CLOSED_POPUP') {
          // User dismissed or closed the login window without completing
          setErrorMessage(null);
        } else {
          setErrorMessage(err.message);
        }
      }
    );

    if (!triggered) {
      setIsLoading(false);
      setStatusMessage('');
    }
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
    });
  };

  // Filter tasks by date: All or This Month
  const displayedTasks = useMemo(() => {
    return filterByDateRange(tasks, dateFilter);
  }, [tasks, dateFilter]);

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

  const isPopupBlockError =
    errorMessage?.includes('popup') ||
    errorMessage?.includes('Popup') ||
    errorMessage?.includes('Failed to open popup');

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
              <button
                onClick={handleLoginClick}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
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

            {/* If popup blocked or iframe issue, offer easy solutions */}
            {isPopupBlockError && (
              <div className="pt-2 border-t border-rose-200 flex flex-wrap items-center gap-2">
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs transition-colors"
                >
                  <NewTabIcon className="w-3.5 h-3.5" />
                  <span>Buka di Tab Baru (Bebas Pembatasan Iframe)</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowManualTokenInput(!showManualTokenInput)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold text-xs transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Masukkan Access Token Manual</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual token input form if popup is blocked */}
        {showManualTokenInput && (
          <form
            onSubmit={handleApplyManualToken}
            className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2"
          >
            <label className="block font-semibold text-slate-700">
              Tempelkan OAuth Access Token Google:
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

      {/* 2. Date Filter: (all, this month) */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Date Filter:
        </span>
        <button
          onClick={() => setDateFilter('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            dateFilter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setDateFilter('this_month')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            dateFilter === 'this_month'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          This Month
        </button>
      </div>

      {/* 3. Daftar Semua Assignments (Tabel: Subject, Description with links, Deadline, Assignment Status) */}
      <section>
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Daftar Semua Assignments
        </h3>

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
          <div className="p-8 text-center border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm">
            {isLoggedIn
              ? 'Tidak ada tugas yang ditemukan di akun Google Classroom Anda untuk filter tanggal ini.'
              : 'Tidak ada tugas untuk filter tanggal yang dipilih.'}
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-xs">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 w-1/4">Subject</th>
                  <th className="py-3 px-4 w-2/5">Description</th>
                  <th className="py-3 px-4 w-1/5">Deadline</th>
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
