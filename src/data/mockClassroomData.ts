import { Course, CourseWork, StudentSubmission } from '../utils/classroom-logic';

export interface StudentProfile {
  name: string;
  email: string;
  school: string;
  grade: string;
  avatarUrl: string;
}

export const MOCK_STUDENT: StudentProfile = {
  name: 'Glenn Bolang (Siswa)',
  email: 'glenn.bolang@makarios.sch.id',
  school: 'Makarios Christian School',
  grade: 'Kelas XI - IPA 1 (EDUNEXUS)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
};

export const MOCK_COURSES: Course[] = [
  {
    id: 'course-mat-11',
    name: 'Matematika Peminatan XI',
    section: 'XI-IPA 1 • Semester Ganjil',
    descriptionHeading: 'Dra. Esther Silaban, M.Pd.',
    room: 'Ruang 204 / Daring',
    courseState: 'ACTIVE',
    alternateLink: 'https://classroom.google.com/c/mock-mat',
  },
  {
    id: 'course-fis-11',
    name: 'Fisika Eksperimen & Teori',
    section: 'XI-IPA • Lab Sains',
    descriptionHeading: 'Ir. Jonathan Wijaya, M.Sc.',
    room: 'Lab Fisika Lt. 3',
    courseState: 'ACTIVE',
    alternateLink: 'https://classroom.google.com/c/mock-fis',
  },
  {
    id: 'course-pak-11',
    name: 'Pendidikan Agama Kristen & Budi Pekerti',
    section: 'XI-Semua Jurusan',
    descriptionHeading: 'Pdt. Samuel Christianto, M.Th.',
    room: 'Chapel Makarios',
    courseState: 'ACTIVE',
    alternateLink: 'https://classroom.google.com/c/mock-pak',
  },
  {
    id: 'course-eng-11',
    name: 'English Academic & Communication',
    section: 'Grade 11 High School',
    descriptionHeading: 'Grace Tan, B.Ed.',
    room: 'Language Center',
    courseState: 'ACTIVE',
    alternateLink: 'https://classroom.google.com/c/mock-eng',
  },
  {
    id: 'course-inf-11',
    name: 'Informatika & Rekayasa Perangkat Lunak',
    section: 'XI-IPA 1 • EDUNEXUS Lab',
    descriptionHeading: 'Glenn Bolang, S.Kom.',
    room: 'Computer Lab 1',
    courseState: 'ACTIVE',
    alternateLink: 'https://classroom.google.com/c/mock-inf',
  },
  {
    id: 'course-bio-11',
    name: 'Biologi Sel & Metabolisme',
    section: 'XI-IPA 1',
    descriptionHeading: 'Dr. Maria Kusuma',
    room: 'Ruang 203',
    courseState: 'ACTIVE',
    alternateLink: 'https://classroom.google.com/c/mock-bio',
  },
];

export const MOCK_COURSEWORK: CourseWork[] = [
  // Matematika
  {
    id: 'cw-mat-01',
    courseId: 'course-mat-11',
    title: 'Latihan 4.2: Persamaan Trigonometri Sudut Ganda',
    description: 'Kerjakan nomor 1 - 10 pada buku cetak halaman 114. Tulis langkah pengerjaan yang rapi pada buku tulis lalu foto dan unggah dalam format PDF.',
    state: 'PUBLISHED',
    alternateLink: 'https://classroom.google.com/c/mock-mat/a/cw-mat-01/details',
    maxPoints: 100,
    dueDate: { year: 2026, month: 11, day: 22 },
    dueTime: { hours: 23, minutes: 59 },
  },
  {
    id: 'cw-mat-02',
    courseId: 'course-mat-11',
    title: 'Kuis Bab 3: Polinomial & Teorema Sisa',
    description: 'Kuis daring via Google Form. Pastikan submit sebelum batas waktu berakhir.',
    state: 'PUBLISHED',
    alternateLink: 'https://classroom.google.com/c/mock-mat/a/cw-mat-02/details',
    maxPoints: 100,
    dueDate: { year: 2026, month: 11, day: 8 },
    dueTime: { hours: 16, minutes: 0 },
  },
  // Fisika
  {
    id: 'cw-fis-01',
    courseId: 'course-fis-11',
    title: 'Laporan Praktikum: Gerak Harmonik Sederhana (Pegas)',
    description: 'Sertakan tabel data pengamatan, grafik osilasi terhadap massa, analisis kesalahan, serta kesimpulan kelompok.',
    state: 'PUBLISHED',
    alternateLink: 'https://classroom.google.com/c/mock-fis/a/cw-fis-01/details',
    maxPoints: 100,
    dueDate: { year: 2026, month: 11, day: 25 },
    dueTime: { hours: 21, minutes: 0 },
  },
  {
    id: 'cw-fis-02',
    courseId: 'course-fis-11',
    title: 'Analisis Soal Fluida Dinamis & Hukum Bernoulli',
    description: 'Selesaikan studi kasus aliran venturimeter dan pipa pitot.',
    state: 'PUBLISHED',
    alternateLink: 'https://classroom.google.com/c/mock-fis/a/cw-fis-02/details',
    maxPoints: 100,
    dueDate: { year: 2026, month: 11, day: 10 },
    dueTime: { hours: 23, minutes: 59 },
  },
  // Pendidikan Agama Kristen
  {
    id: 'cw-pak-01',
    courseId: 'course-pak-11',
    title: 'Refleksi Pribadi: Karakter Kristiani di Era Digital',
    description: 'Tuliskan esai refleksi 500 kata tentang bagaimana nilai integritas dan kasih diimplementasikan dalam interaksi media sosial sehari-hari.',
    state: 'PUBLISHED',
    alternateLink: 'https://classroom.google.com/c/mock-pak/a/cw-pak-01/details',
    maxPoints: 100,
    dueDate: { year: 2026, month: 11, day: 28 },
    dueTime: { hours: 18, minutes: 0 },
  },
  // English
  {
    id: 'cw-eng-01',
    courseId: 'course-eng-11',
    title: 'Analytical Exposition Essay: Sustainable Future',
    description: 'Write a 400-word analytical exposition essay. Format in MLA with thesis statement, arguments, and reiteration.',
    state: 'PUBLISHED',
    alternateLink: 'https://classroom.google.com/c/mock-eng/a/cw-eng-01/details',
    maxPoints: 100,
    dueDate: { year: 2026, month: 11, day: 18 },
    dueTime: { hours: 23, minutes: 59 },
  },
  {
    id: 'cw-eng-02',
    courseId: 'course-eng-11',
    title: 'Listening & Speaking Video Presentation',
    description: 'Submit your 3-minute video presentation link discussing innovative educational tools.',
    state: 'PUBLISHED',
    alternateLink: 'https://classroom.google.com/c/mock-eng/a/cw-eng-02/details',
    maxPoints: 100,
    dueDate: { year: 2026, month: 11, day: 5 },
    dueTime: { hours: 12, minutes: 0 },
  },
  // Informatika
  {
    id: 'cw-inf-01',
    courseId: 'course-inf-11',
    title: 'Proyek EDUNEXUS: Implementasi API Google Classroom v1',
    description: 'Bangun dashboard pemantau tugas dengan GIS (Google Identity Services) dan otentikasi OAuth 2.0. Hubungkan REST endpoints dan status tugas siswa.',
    state: 'PUBLISHED',
    alternateLink: 'https://classroom.google.com/c/mock-inf/a/cw-inf-01/details',
    maxPoints: 100,
    dueDate: { year: 2026, month: 11, day: 30 },
    dueTime: { hours: 23, minutes: 59 },
  },
  // Biologi
  {
    id: 'cw-bio-01',
    courseId: 'course-bio-11',
    title: 'Diagram & Siklus Krebs (Respirasi Aerob)',
    description: 'Gambar diagram alir respirasi seluler mulai dari Glikolisis, Dekarboksilasi Oksidatif, Siklus Krebs, hingga Transpor Elektron.',
    state: 'PUBLISHED',
    alternateLink: 'https://classroom.google.com/c/mock-bio/a/cw-bio-01/details',
    maxPoints: 100,
  },
];

export const MOCK_SUBMISSIONS: Record<string, StudentSubmission> = {
  // Matematika 1: Belum dikerjakan (due in future)
  'cw-mat-01': {
    id: 'sub-mat-01',
    courseId: 'course-mat-11',
    courseWorkId: 'cw-mat-01',
    userId: 'user-glenn',
    state: 'CREATED',
  },
  // Matematika 2: Selesai & Dinilai 98/100
  'cw-mat-02': {
    id: 'sub-mat-02',
    courseId: 'course-mat-11',
    courseWorkId: 'cw-mat-02',
    userId: 'user-glenn',
    state: 'RETURNED',
    assignedGrade: 98,
  },
  // Fisika 1: Belum dikerjakan (due in future)
  'cw-fis-01': {
    id: 'sub-fis-01',
    courseId: 'course-fis-11',
    courseWorkId: 'cw-fis-01',
    userId: 'user-glenn',
    state: 'CREATED',
  },
  // Fisika 2: Terlambat / Missing (due in past, unsubmitted)
  'cw-fis-02': {
    id: 'sub-fis-02',
    courseId: 'course-fis-11',
    courseWorkId: 'cw-fis-02',
    userId: 'user-glenn',
    state: 'CREATED',
  },
  // PAK: Diserahkan (Turned In)
  'cw-pak-01': {
    id: 'sub-pak-01',
    courseId: 'course-pak-11',
    courseWorkId: 'cw-pak-01',
    userId: 'user-glenn',
    state: 'TURNED_IN',
  },
  // English 1: Diserahkan (Turned In)
  'cw-eng-01': {
    id: 'sub-eng-01',
    courseId: 'course-eng-11',
    courseWorkId: 'cw-eng-01',
    userId: 'user-glenn',
    state: 'TURNED_IN',
  },
  // English 2: Dinilai 92/100
  'cw-eng-02': {
    id: 'sub-eng-02',
    courseId: 'course-eng-11',
    courseWorkId: 'cw-eng-02',
    userId: 'user-glenn',
    state: 'RETURNED',
    assignedGrade: 92,
  },
  // Informatika: Diserahkan (Turned In)
  'cw-inf-01': {
    id: 'sub-inf-01',
    courseId: 'course-inf-11',
    courseWorkId: 'cw-inf-01',
    userId: 'user-glenn',
    state: 'TURNED_IN',
  },
  // Biologi: Belum dikerjakan (No due date)
  'cw-bio-01': {
    id: 'sub-bio-01',
    courseId: 'course-bio-11',
    courseWorkId: 'cw-bio-01',
    userId: 'user-glenn',
    state: 'CREATED',
  },
};
