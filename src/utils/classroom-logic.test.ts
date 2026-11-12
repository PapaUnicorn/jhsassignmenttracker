import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseClassroomDueDate,
  formatDisplayDate,
  computeTaskStatus,
  buildConsolidatedTask,
  calculateTaskStatistics,
  filterAndSortTasks,
  filterByDateRange,
  Course,
  CourseWork,
  StudentSubmission,
} from './classroom-logic';

test('parseClassroomDueDate converts Google Date/Time format correctly', () => {
  const parsed = parseClassroomDueDate(
    { year: 2026, month: 11, day: 20 },
    { hours: 14, minutes: 30 }
  );

  assert.ok(parsed.date !== null);
  assert.equal(parsed.date?.getFullYear(), 2026);
  assert.equal(parsed.date?.getMonth(), 10); // 0-indexed month (November)
  assert.equal(parsed.date?.getDate(), 20);
  assert.equal(parsed.date?.getHours(), 14);
  assert.equal(parsed.date?.getMinutes(), 30);
});

test('parseClassroomDueDate returns null for missing date', () => {
  const parsed = parseClassroomDueDate(undefined, undefined);
  assert.equal(parsed.date, null);
  assert.equal(parsed.timestamp, null);
});

test('computeTaskStatus handles TURNED_IN and RETURNED properly', () => {
  const dummyWork: CourseWork = {
    id: 'cw-1',
    courseId: 'c-1',
    title: 'Tugas Matematika',
    state: 'PUBLISHED',
  };

  const returnedSub: StudentSubmission = {
    id: 'sub-1',
    courseId: 'c-1',
    courseWorkId: 'cw-1',
    userId: 'u-1',
    state: 'RETURNED',
    assignedGrade: 95,
  };

  const status1 = computeTaskStatus(dummyWork, returnedSub);
  assert.equal(status1.status, 'RETURNED');
  assert.match(status1.statusLabel, /Dinilai/);

  const turnedInSub: StudentSubmission = {
    id: 'sub-2',
    courseId: 'c-1',
    courseWorkId: 'cw-1',
    userId: 'u-1',
    state: 'TURNED_IN',
  };

  const status2 = computeTaskStatus(dummyWork, turnedInSub);
  assert.equal(status2.status, 'TURNED_IN');
  assert.match(status2.statusLabel, /Diserahkan/);
});

test('computeTaskStatus marks past due unsubmitted work as MISSING', () => {
  const now = new Date('2026-11-15T12:00:00Z').getTime();

  // Due in the past (Nov 10)
  const pastWork: CourseWork = {
    id: 'cw-past',
    courseId: 'c-1',
    title: 'Makalah Sejarah',
    state: 'PUBLISHED',
    dueDate: { year: 2026, month: 11, day: 10 },
    dueTime: { hours: 23, minutes: 59 },
  };

  const unsubmitted: StudentSubmission = {
    id: 'sub-3',
    courseId: 'c-1',
    courseWorkId: 'cw-past',
    userId: 'u-1',
    state: 'CREATED',
  };

  const status = computeTaskStatus(pastWork, unsubmitted, now);
  assert.equal(status.status, 'MISSING');
  assert.equal(status.isPastDue, true);
});

test('calculateTaskStatistics computes correct counts and completion percentage', () => {
  const dummyCourse: Course = {
    id: 'c-101',
    name: 'Fisika Kelas XI',
    courseState: 'ACTIVE',
  };

  const task1 = buildConsolidatedTask(
    dummyCourse,
    { id: '1', courseId: 'c-101', title: 'Lab 1', state: 'PUBLISHED' },
    { id: 's1', courseId: 'c-101', courseWorkId: '1', userId: 'u', state: 'RETURNED' }
  );

  const task2 = buildConsolidatedTask(
    dummyCourse,
    { id: '2', courseId: 'c-101', title: 'Lab 2', state: 'PUBLISHED' },
    { id: 's2', courseId: 'c-101', courseWorkId: '2', userId: 'u', state: 'TURNED_IN' }
  );

  const task3 = buildConsolidatedTask(
    dummyCourse,
    { id: '3', courseId: 'c-101', title: 'Lab 3', state: 'PUBLISHED' },
    { id: 's3', courseId: 'c-101', courseWorkId: '3', userId: 'u', state: 'CREATED' }
  );

  const task4 = buildConsolidatedTask(
    dummyCourse,
    {
      id: '4',
      courseId: 'c-101',
      title: 'Lab 4',
      state: 'PUBLISHED',
      dueDate: { year: 2020, month: 1, day: 1 },
    },
    { id: 's4', courseId: 'c-101', courseWorkId: '4', userId: 'u', state: 'CREATED' }
  );

  const stats = calculateTaskStatistics([task1, task2, task3, task4]);
  assert.equal(stats.total, 4);
  assert.equal(stats.completed, 2);
  assert.equal(stats.turnedIn, 1);
  assert.equal(stats.returned, 1);
  assert.equal(stats.created, 1);
  assert.equal(stats.missing, 1);
  assert.equal(stats.completionRate, 50);
});

test('filterAndSortTasks correctly filters by status and search keyword', () => {
  const dummyCourse: Course = {
    id: 'c-bio',
    name: 'Biologi Sel',
    courseState: 'ACTIVE',
  };

  const tasks = [
    buildConsolidatedTask(
      dummyCourse,
      { id: '1', courseId: 'c-bio', title: 'Struktur Membran', state: 'PUBLISHED' },
      { id: 's1', courseId: 'c-bio', courseWorkId: '1', userId: 'u', state: 'TURNED_IN' }
    ),
    buildConsolidatedTask(
      dummyCourse,
      { id: '2', courseId: 'c-bio', title: 'Fotosintesis', state: 'PUBLISHED' },
      { id: 's2', courseId: 'c-bio', courseWorkId: '2', userId: 'u', state: 'CREATED' }
    ),
  ];

  const searchResult = filterAndSortTasks(tasks, 'ALL', 'ALL', 'fotosintesis');
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].title, 'Fotosintesis');

  const turnedInResult = filterAndSortTasks(tasks, 'ALL', 'TURNED_IN');
  assert.equal(turnedInResult.length, 1);
  assert.equal(turnedInResult[0].title, 'Struktur Membran');
});

test('filterByDateRange filters correctly between all and this_month', () => {
  const dummyCourse: Course = {
    id: 'c-test',
    name: 'Sains',
    courseState: 'ACTIVE',
  };

  const refNow = new Date('2026-11-15T00:00:00Z').getTime();

  const thisMonthTask = buildConsolidatedTask(
    dummyCourse,
    {
      id: '1',
      courseId: 'c-test',
      title: 'Tugas November',
      state: 'PUBLISHED',
      dueDate: { year: 2026, month: 11, day: 20 },
    },
    undefined,
    refNow
  );

  const nextMonthTask = buildConsolidatedTask(
    dummyCourse,
    {
      id: '2',
      courseId: 'c-test',
      title: 'Tugas Desember',
      state: 'PUBLISHED',
      dueDate: { year: 2026, month: 12, day: 5 },
    },
    undefined,
    refNow
  );

  const all = filterByDateRange([thisMonthTask, nextMonthTask], 'all', refNow);
  assert.equal(all.length, 2);

  const thisMonth = filterByDateRange([thisMonthTask, nextMonthTask], 'this_month', refNow);
  assert.equal(thisMonth.length, 1);
  assert.equal(thisMonth[0].title, 'Tugas November');
});
