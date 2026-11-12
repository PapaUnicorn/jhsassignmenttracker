/**
 * Google Classroom API v1 & Google Identity Services (GIS) Service
 * Architecture:
 * 1. GIS Token Client (OAuth 2.0 Implicit Grant / Authorization Code via Token Client)
 * 2. Hierarchical Classroom API chaining:
 *    Courses (ACTIVE) -> CourseWork -> StudentSubmissions
 * 3. Robust Error Handling & Progress reporting
 */

import {
  Course,
  CourseWork,
  StudentSubmission,
  ConsolidatedTask,
  buildConsolidatedTask,
} from '../utils/classroom-logic';
import {
  MOCK_COURSES,
  MOCK_COURSEWORK,
  MOCK_SUBMISSIONS,
  MOCK_STUDENT,
  StudentProfile,
} from '../data/mockClassroomData';

export const CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

export const DEFAULT_CLIENT_ID_PLACEHOLDER = 'YOUR_CLIENT_ID_HERE';

// Global declaration for Google Identity Services window object
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          revoke: (accessToken: string, callback?: () => void) => void;
        };
      };
    };
  }
}

/**
 * Fetch with standard Bearer authorization header and structured error handling
 */
async function apiGet<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson?.error?.message) {
        errorDetail = errJson.error.message;
      }
    } catch {
      // ignore json parse error
    }

    if (response.status === 401) {
      throw new Error(`Sesi login Google telah kedaluwarsa (401). Silakan login ulang: ${errorDetail}`);
    } else if (response.status === 403) {
      throw new Error(`Akses ditolak (403). Pastikan Google Classroom API diaktifkan di Google Cloud Console dan scope disetujui: ${errorDetail}`);
    } else {
      throw new Error(`Gagal memanggil API (${response.status}): ${errorDetail}`);
    }
  }

  return response.json();
}

/**
 * Fetch authenticated user profile details from Google People / UserInfo API
 */
export async function fetchGoogleUserProfile(token: string): Promise<StudentProfile> {
  try {
    const data = await apiGet<{
      name?: string;
      email?: string;
      picture?: string;
    }>('https://www.googleapis.com/oauth2/v2/userinfo', token);

    return {
      name: data.name || 'Siswa Makarios',
      email: data.email || 'siswa@makarios.sch.id',
      school: 'Makarios Christian School',
      grade: 'EDUNEXUS Active Student',
      avatarUrl: data.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    };
  } catch (err) {
    console.warn('Could not fetch user profile details, using default placeholder:', err);
    return {
      name: 'Siswa Makarios Christian School',
      email: 'siswa@makarios.sch.id',
      school: 'Makarios Christian School',
      grade: 'EDUNEXUS Student',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    };
  }
}

export interface FetchResult {
  courses: Course[];
  tasks: ConsolidatedTask[];
}

/**
 * Complete Hierarchical Fetch Chain from Google Classroom API v1
 * 1. Fetch courses.list (ACTIVE)
 * 2. Fetch courseWork.list for each course
 * 3. Fetch studentSubmissions.list for each coursework
 */
export async function fetchLiveGoogleClassroomData(
  token: string,
  onProgress?: (statusMessage: string) => void
): Promise<FetchResult> {
  onProgress?.('Menghubungkan ke Google Classroom API v1...');

  // Step 1: Fetch active courses
  onProgress?.('Mengambil daftar mata pelajaran aktif (classroom.courses.list)...');
  const coursesResponse = await apiGet<{ courses?: Course[] }>(
    'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE',
    token
  );

  const courses = coursesResponse.courses || [];
  if (courses.length === 0) {
    onProgress?.('Tidak ada kelas aktif ditemukan.');
    return { courses: [], tasks: [] };
  }

  const consolidatedTasks: ConsolidatedTask[] = [];

  // Step 2 & 3: Iterate through each active course
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    onProgress?.(`[${i + 1}/${courses.length}] Memeriksa tugas: ${course.name}...`);

    try {
      const cwResponse = await apiGet<{ courseWork?: CourseWork[] }>(
        `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork?courseWorkStates=PUBLISHED`,
        token
      );

      const courseWorks = cwResponse.courseWork || [];

      // For each coursework, fetch submission status
      for (const cw of courseWorks) {
        let submission: StudentSubmission | undefined;
        try {
          const subResponse = await apiGet<{ studentSubmissions?: StudentSubmission[] }>(
            `https://classroom.googleapis.com/v1/courses/${course.id}/courseWork/${cw.id}/studentSubmissions`,
            token
          );
          if (subResponse.studentSubmissions && subResponse.studentSubmissions.length > 0) {
            submission = subResponse.studentSubmissions[0];
          }
        } catch (subErr) {
          console.warn(`Gagal memuat status submission tugas ${cw.title}:`, subErr);
        }

        const consolidated = buildConsolidatedTask(course, cw, submission);
        consolidatedTasks.push(consolidated);
      }
    } catch (cwErr) {
      console.warn(`Gagal memuat tugas untuk kelas ${course.name}:`, cwErr);
    }
  }

  onProgress?.(`Selesai! Berhasil memuat ${consolidatedTasks.length} tugas dari ${courses.length} kelas.`);
  return {
    courses,
    tasks: consolidatedTasks,
  };
}

/**
 * Load realistic simulated data for Makarios Christian School (for immediate preview / testing without credentials)
 */
export async function fetchSimulatedClassroomData(
  onProgress?: (statusMessage: string) => void
): Promise<FetchResult> {
  onProgress?.('Memuat modul simulasi EDUNEXUS Makarios Christian School...');
  await new Promise((r) => setTimeout(r, 600));

  onProgress?.('Menghubungkan kursus aktif (6 Mata Pelajaran)...');
  await new Promise((r) => setTimeout(r, 400));

  onProgress?.('Merekap status submission pengerjaan siswa...');
  await new Promise((r) => setTimeout(r, 400));

  const consolidatedTasks: ConsolidatedTask[] = [];
  const courseMap = new Map<string, Course>();
  MOCK_COURSES.forEach((c) => courseMap.set(c.id, c));

  for (const cw of MOCK_COURSEWORK) {
    const course = courseMap.get(cw.courseId) || {
      id: cw.courseId,
      name: 'Mata Pelajaran',
      courseState: 'ACTIVE',
    };
    const sub = MOCK_SUBMISSIONS[cw.id];
    consolidatedTasks.push(buildConsolidatedTask(course, cw, sub));
  }

  onProgress?.('Data berhasil dimuat!');
  return {
    courses: MOCK_COURSES,
    tasks: consolidatedTasks,
  };
}
