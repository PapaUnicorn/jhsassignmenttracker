/**
 * Pure business logic and data transformers for Google Classroom Task Monitor
 * EDUNEXUS / Makarios Christian School
 */

export interface GoogleDate {
  year?: number;
  month?: number;
  day?: number;
}

export interface GoogleTimeOfDay {
  hours?: number;
  minutes?: number;
  seconds?: number;
  nanos?: number;
}

export interface CourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: GoogleDate;
  dueTime?: GoogleTimeOfDay;
  maxPoints?: number;
  workType?: string;
}

export interface StudentSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  userId: string;
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  late?: boolean;
  draftGrade?: number;
  assignedGrade?: number;
  alternateLink?: string;
  submissionHistory?: Array<{
    stateHistory?: {
      state: string;
      stateTimestamp: string;
    };
  }>;
}

export interface Course {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  courseState: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  alternateLink?: string;
  teacherFolder?: {
    title?: string;
    alternateLink?: string;
  };
}

export type TaskStatus = 'TURNED_IN' | 'RETURNED' | 'MISSING' | 'CREATED' | 'RECLAIMED';

export interface ConsolidatedTask {
  id: string;
  courseId: string;
  courseName: string;
  courseSection?: string;
  title: string;
  description?: string;
  alternateLink: string;
  dueTimestamp: number | null;
  formattedDueDate: string;
  isPastDue: boolean;
  maxPoints?: number;
  submissionId?: string;
  rawState?: string;
  isLateSubmission?: boolean;
  assignedGrade?: number;
  status: TaskStatus;
  statusLabel: string;
  statusBadgeColor: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
}

/**
 * Format Google Classroom Due Date and Due Time into standard Date object and timestamp
 */
export function parseClassroomDueDate(
  dueDate?: GoogleDate,
  dueTime?: GoogleTimeOfDay
): { date: Date | null; timestamp: number | null } {
  if (!dueDate || !dueDate.year || !dueDate.month || !dueDate.day) {
    return { date: null, timestamp: null };
  }

  // Note: Google API months are 1-based (1 = January)
  const year = dueDate.year;
  const month = dueDate.month - 1;
  const day = dueDate.day;
  const hours = dueTime?.hours ?? 23;
  const minutes = dueTime?.minutes ?? 59;
  const seconds = dueTime?.seconds ?? 59;

  const date = new Date(year, month, day, hours, minutes, seconds);
  return { date, timestamp: date.getTime() };
}

/**
 * Format date for friendly human display (Indonesian / English bilingual friendly)
 */
export function formatDisplayDate(timestamp: number | null, referenceNow = Date.now()): string {
  if (!timestamp) {
    return 'Tanpa Tenggat (No Due Date)';
  }

  const targetDate = new Date(timestamp);
  const now = new Date(referenceNow);

  const diffMs = timestamp - referenceNow;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const timeString = targetDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: targetDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  };
  const dateFormatted = targetDate.toLocaleDateString('id-ID', dateOptions);

  if (diffDays === 0) {
    return `Hari ini, ${timeString}`;
  } else if (diffDays === 1) {
    return `Besok, ${timeString}`;
  } else if (diffDays === -1) {
    return `Kemarin, ${timeString}`;
  } else if (diffDays < -1) {
    return `${dateFormatted}, ${timeString} (Lewat)`;
  }

  return `${dateFormatted}, ${timeString}`;
}

/**
 * Compute the consolidated task status based on coursework and submission state
 */
export function computeTaskStatus(
  courseWork: CourseWork,
  submission?: StudentSubmission,
  referenceNow = Date.now()
): {
  status: TaskStatus;
  statusLabel: string;
  isPastDue: boolean;
  statusBadgeColor: ConsolidatedTask['statusBadgeColor'];
} {
  const { timestamp } = parseClassroomDueDate(courseWork.dueDate, courseWork.dueTime);
  const isPastDue = timestamp !== null && timestamp < referenceNow;

  const subState = submission?.state;
  const isLate = Boolean(submission?.late);

  // 1. If graded or returned by teacher
  if (subState === 'RETURNED') {
    return {
      status: 'RETURNED',
      statusLabel: 'Dinilai (Graded)',
      isPastDue,
      statusBadgeColor: {
        bg: 'bg-blue-500/10 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500',
      },
    };
  }

  // 2. If student turned it in
  if (subState === 'TURNED_IN') {
    return {
      status: 'TURNED_IN',
      statusLabel: isLate ? 'Diserahkan (Terlambat)' : 'Diserahkan (Turned In)',
      isPastDue,
      statusBadgeColor: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      },
    };
  }

  // 3. If reclaimed
  if (subState === 'RECLAIMED_BY_STUDENT') {
    if (isPastDue) {
      return {
        status: 'MISSING',
        statusLabel: 'Terlambat (Missing)',
        isPastDue,
        statusBadgeColor: {
          bg: 'bg-rose-500/10 dark:bg-rose-950/40',
          text: 'text-rose-700 dark:text-rose-400',
          border: 'border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500',
        },
      };
    }
    return {
      status: 'RECLAIMED',
      statusLabel: 'Ditarik Kembali',
      isPastDue,
      statusBadgeColor: {
        bg: 'bg-amber-500/10 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      },
    };
  }

  // 4. If deadline has passed and not submitted -> MISSING
  if (isPastDue) {
    return {
      status: 'MISSING',
      statusLabel: 'Terlambat (Missing)',
      isPastDue,
      statusBadgeColor: {
        bg: 'bg-rose-500/10 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
      },
    };
  }

  // 5. Still pending, deadline in the future or no deadline -> Belum Dikerjakan (CREATED)
  return {
    status: 'CREATED',
    statusLabel: 'Belum Dikerjakan (Assigned)',
    isPastDue: false,
    statusBadgeColor: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
    },
  };
}

/**
 * Consolidate Course + CourseWork + StudentSubmission into standardized UI item
 */
export function buildConsolidatedTask(
  course: Course,
  courseWork: CourseWork,
  submission?: StudentSubmission,
  referenceNow = Date.now()
): ConsolidatedTask {
  const { timestamp } = parseClassroomDueDate(courseWork.dueDate, courseWork.dueTime);
  const statusInfo = computeTaskStatus(courseWork, submission, referenceNow);

  return {
    id: courseWork.id,
    courseId: course.id,
    courseName: course.name,
    courseSection: course.section,
    title: courseWork.title,
    description: courseWork.description,
    alternateLink:
      courseWork.alternateLink ||
      `https://classroom.google.com/c/${course.id}/a/${courseWork.id}/details`,
    dueTimestamp: timestamp,
    formattedDueDate: formatDisplayDate(timestamp, referenceNow),
    isPastDue: statusInfo.isPastDue,
    maxPoints: courseWork.maxPoints,
    submissionId: submission?.id,
    rawState: submission?.state,
    isLateSubmission: submission?.late,
    assignedGrade: submission?.assignedGrade,
    status: statusInfo.status,
    statusLabel: statusInfo.statusLabel,
    statusBadgeColor: statusInfo.statusBadgeColor,
  };
}

/**
 * Calculate dashboard summary statistics
 */
export function calculateTaskStatistics(tasks: ConsolidatedTask[]) {
  const total = tasks.length;
  let turnedIn = 0;
  let returned = 0;
  let missing = 0;
  let created = 0;

  for (const t of tasks) {
    if (t.status === 'TURNED_IN') turnedIn++;
    else if (t.status === 'RETURNED') returned++;
    else if (t.status === 'MISSING') missing++;
    else created++;
  }

  const completed = turnedIn + returned;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    turnedIn,
    returned,
    missing,
    created,
    completionRate,
  };
}

/**
 * Filter and sort task list
 */
export function filterAndSortTasks(
  tasks: ConsolidatedTask[],
  filterCourseId: string = 'ALL',
  filterStatus: string = 'ALL',
  searchQuery: string = '',
  sortBy: 'DUE_DATE_ASC' | 'DUE_DATE_DESC' | 'TITLE_ASC' = 'DUE_DATE_ASC'
): ConsolidatedTask[] {
  let result = tasks;

  if (filterCourseId !== 'ALL') {
    result = result.filter((t) => t.courseId === filterCourseId);
  }

  if (filterStatus !== 'ALL') {
    if (filterStatus === 'COMPLETED') {
      result = result.filter((t) => t.status === 'TURNED_IN' || t.status === 'RETURNED');
    } else {
      result = result.filter((t) => t.status === filterStatus);
    }
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.courseName.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }

  return [...result].sort((a, b) => {
    if (sortBy === 'TITLE_ASC') {
      return a.title.localeCompare(b.title);
    }
    const timeA = a.dueTimestamp ?? Number.MAX_SAFE_INTEGER;
    const timeB = b.dueTimestamp ?? Number.MAX_SAFE_INTEGER;
    if (sortBy === 'DUE_DATE_ASC') {
      return timeA - timeB;
    } else {
      return timeB - timeA;
    }
  });
}

/**
 * Filter tasks by date range ('all' or 'this_month')
 */
export function filterByDateRange(
  tasks: ConsolidatedTask[],
  dateFilter: 'all' | 'this_month',
  referenceNow = Date.now()
): ConsolidatedTask[] {
  if (dateFilter === 'all') return tasks;

  const now = new Date(referenceNow);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return tasks.filter((task) => {
    if (!task.dueTimestamp) return false;
    const taskDate = new Date(task.dueTimestamp);
    return (
      taskDate.getMonth() === currentMonth &&
      taskDate.getFullYear() === currentYear
    );
  });
}

